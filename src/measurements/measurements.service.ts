import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Measurement } from './entities/measurement.entity';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { UpdateMeasurementDto } from './dto/update-measurement.dto';

import { Sensor } from '../sensors/entities/sensor.entity';
import { Threshold } from '../thresholds/entities/threshold.entity';
import { Alert } from '../alerts/entities/alert.entity';
import { AuditService } from '../audit/audit.service';

type DbRole = 'EMPLOYEE' | 'ADMIN' | 'OWNER';

@Injectable()
export class MeasurementsService {
  constructor(
    @InjectRepository(Measurement)
    private readonly measurementRepo: Repository<Measurement>,

    @InjectRepository(Sensor)
    private readonly sensorRepo: Repository<Sensor>,

    @InjectRepository(Threshold)
    private readonly thresholdRepo: Repository<Threshold>,

    @InjectRepository(Alert)
    private readonly alertRepo: Repository<Alert>,

    private readonly auditService: AuditService,
  ) {}

  async findAll(): Promise<Measurement[]> {
    return this.measurementRepo.find({
      order: { measurement_id: 'DESC' },
      relations: ['sensor'],
    });
  }

  async findOne(measurement_id: number): Promise<Measurement> {
    const m = await this.measurementRepo.findOne({
      where: { measurement_id },
      relations: ['sensor'],
    });
    if (!m) throw new NotFoundException('Measurement not found');
    return m;
  }

  async create(
    dto: CreateMeasurementDto,
    actor_user_id: number,
    actor_role: DbRole,
  ): Promise<Measurement> {
    if (dto.temperature_c === undefined || dto.humidity_percent === undefined) {
      throw new BadRequestException(
        'temperature_c and humidity_percent are required',
      );
    }

    const sensor = await this.sensorRepo.findOne({
      where: { sensor_id: dto.sensor_id },
    });
    if (!sensor) throw new NotFoundException('Sensor not found');

    const warehouse_id = sensor.warehouse_id;

    const measuredAt = dto.measured_at ? new Date(dto.measured_at) : new Date();

    const measurement = this.measurementRepo.create({
      measured_at: measuredAt,
      temperature_c: dto.temperature_c,
      humidity_percent: dto.humidity_percent,
      sensor_id: dto.sensor_id,
    });

    const saved = await this.measurementRepo.save(measurement);

    // AUDIT: measurement created
    await this.auditService.log({
      actor_user_id,
      actor_role,
      action: 'CREATE',
      entity: 'MEASUREMENTS',
      entity_id: saved.measurement_id,
      details: `Measurement created for sensor_id=${saved.sensor_id} (t=${saved.temperature_c}, h=${saved.humidity_percent})`,
    });

    const thresholds = await this.thresholdRepo.findOne({
      where: { warehouse_id },
    });

    if (!thresholds) return saved;

    const violations: string[] = [];

    if (saved.temperature_c > thresholds.temp_max) violations.push('TEMP_HIGH');
    if (saved.temperature_c < thresholds.temp_min) violations.push('TEMP_LOW');

    if (saved.humidity_percent > thresholds.humidity_max)
      violations.push('HUMIDITY_HIGH');
    if (saved.humidity_percent < thresholds.humidity_min)
      violations.push('HUMIDITY_LOW');

    // створюємо NEW alerts якщо такого NEW ще нема
    for (const type of violations) {
      const existing = await this.alertRepo.findOne({
        where: {
          type,
          status: 'NEW',
          warehouse_id,
          sensor_id: sensor.sensor_id,
        },
      });

      if (!existing) {
        const alert = this.alertRepo.create({
          type,
          status: 'NEW',
          created_at: new Date(),
          resolved_at: null,
          warehouse_id,
          sensor_id: sensor.sensor_id,
          user_id: null,
        });

        const createdAlert = await this.alertRepo.save(alert);

        await this.auditService.log({
          actor_user_id,
          actor_role,
          action: 'CREATE',
          entity: 'ALERTS',
          entity_id: createdAlert.alert_id,
          details: `Auto-created alert type=${createdAlert.type} from measurement_id=${saved.measurement_id}`,
        });
      }
    }

    // якщо параметр нормальний — закриваємо відповідні NEW alerts
    const violated = new Set(violations);

    const humidityNowOk =
      !violated.has('HUMIDITY_HIGH') && !violated.has('HUMIDITY_LOW');
    if (humidityNowOk) {
      const activeHumidity = await this.alertRepo.find({
        where: {
          status: 'NEW',
          warehouse_id,
          sensor_id: sensor.sensor_id,
        },
      });

      for (const a of activeHumidity) {
        if (a.type === 'HUMIDITY_HIGH' || a.type === 'HUMIDITY_LOW') {
          a.status = 'RESOLVED';
          a.resolved_at = new Date();
          const savedAlert = await this.alertRepo.save(a);

          // AUDIT (опційно): alert resolved by normalization
          await this.auditService.log({
            actor_user_id,
            actor_role,
            action: 'UPDATE',
            entity: 'ALERTS',
            entity_id: savedAlert.alert_id,
            details: `Auto-resolved alert type=${savedAlert.type} by measurement normalization`,
          });
        }
      }
    }

    const tempNowOk = !violated.has('TEMP_HIGH') && !violated.has('TEMP_LOW');
    if (tempNowOk) {
      const activeTemp = await this.alertRepo.find({
        where: {
          status: 'NEW',
          warehouse_id,
          sensor_id: sensor.sensor_id,
        },
      });

      for (const a of activeTemp) {
        if (a.type === 'TEMP_HIGH' || a.type === 'TEMP_LOW') {
          a.status = 'RESOLVED';
          a.resolved_at = new Date();
          const savedAlert = await this.alertRepo.save(a);

          await this.auditService.log({
            actor_user_id,
            actor_role,
            action: 'UPDATE',
            entity: 'ALERTS',
            entity_id: savedAlert.alert_id,
            details: `Auto-resolved alert type=${savedAlert.type} by measurement normalization`,
          });
        }
      }
    }

    return saved;
  }

  async update(
    measurement_id: number,
    dto: UpdateMeasurementDto,
    actor_user_id: number,
    actor_role: DbRole,
  ): Promise<Measurement> {
    const m = await this.findOne(measurement_id);

    Object.assign(m, {
      ...dto,
      measured_at: dto.measured_at ? new Date(dto.measured_at) : m.measured_at,
    });

    const saved = await this.measurementRepo.save(m);

    await this.auditService.log({
      actor_user_id,
      actor_role,
      action: 'UPDATE',
      entity: 'MEASUREMENTS',
      entity_id: saved.measurement_id,
      details: 'Measurement updated',
    });

    return saved;
  }

  async remove(
    measurement_id: number,
    actor_user_id: number,
    actor_role: DbRole,
  ): Promise<void> {
    const m = await this.findOne(measurement_id);
    await this.measurementRepo.remove(m);

    await this.auditService.log({
      actor_user_id,
      actor_role,
      action: 'DELETE',
      entity: 'MEASUREMENTS',
      entity_id: measurement_id,
      details: 'Measurement deleted',
    });
  }
}
