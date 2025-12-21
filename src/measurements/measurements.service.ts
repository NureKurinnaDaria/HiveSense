import {
  BadRequestException,
  ForbiddenException,
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
import { User } from '../users/entities/user.entity';
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

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly auditService: AuditService,
  ) {}

  private async getEmployeeActorOrThrow(actor_user_id: number): Promise<User> {
    const actor = await this.userRepo.findOne({
      where: { user_id: actor_user_id },
    });

    if (!actor) throw new NotFoundException('User not found');

    if (actor.role !== 'EMPLOYEE') {
      throw new ForbiddenException('Only EMPLOYEE can perform this action');
    }

    if (actor.warehouse_id == null) {
      throw new ForbiddenException('EMPLOYEE must be assigned to a warehouse');
    }

    return actor;
  }

  /**
   * Витягуємо measurement + sensor (щоб перевіряти склад)
   */
  private async findOneWithSensor(
    measurement_id: number,
  ): Promise<Measurement> {
    const m = await this.measurementRepo.findOne({
      where: { measurement_id },
      relations: ['sensor'],
    });

    if (!m) throw new NotFoundException('Measurement not found');
    if (!m.sensor) throw new NotFoundException('Sensor not found');

    return m;
  }

  /**
   * Список вимірювань:
   * - ADMIN/OWNER: все
   * - EMPLOYEE: лише по своєму складу (sensor.warehouse_id)
   */
  async findAll(
    actor_user_id: number,
    actor_role: DbRole,
  ): Promise<Measurement[]> {
    if (actor_role === 'EMPLOYEE') {
      const actor = await this.getEmployeeActorOrThrow(actor_user_id);

      return this.measurementRepo
        .createQueryBuilder('m')
        .innerJoinAndSelect('m.sensor', 's')
        .where('s.warehouse_id = :wid', { wid: actor.warehouse_id })
        .orderBy('m.measurement_id', 'DESC')
        .getMany();
    }

    return this.measurementRepo.find({
      order: { measurement_id: 'DESC' },
      relations: ['sensor'],
    });
  }

  /**
   * Окреме вимірювання:
   * - ADMIN/OWNER: будь-яке
   * - EMPLOYEE: тільки якщо sensor.warehouse_id == actor.warehouse_id
   */
  async findOne(
    measurement_id: number,
    actor_user_id: number,
    actor_role: DbRole,
  ): Promise<Measurement> {
    const m = await this.findOneWithSensor(measurement_id);

    if (actor_role === 'EMPLOYEE') {
      const actor = await this.getEmployeeActorOrThrow(actor_user_id);

      if (m.sensor.warehouse_id !== actor.warehouse_id) {
        throw new ForbiddenException(
          'You cannot access measurements from another warehouse',
        );
      }
    }

    return m;
  }

  /**
   * CREATE
   * - Перевіряємо sensor існує
   * - EMPLOYEE може створити лише для sensor свого складу
   * - Далі: пороги -> автотривоги NEW/RESOLVED
   */
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

    // EMPLOYEE: тільки свій склад
    if (actor_role === 'EMPLOYEE') {
      const actor = await this.getEmployeeActorOrThrow(actor_user_id);
      if (sensor.warehouse_id !== actor.warehouse_id) {
        throw new ForbiddenException(
          'You cannot create measurements for another warehouse sensor',
        );
      }
    }

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

    // важливо: decimal може вертатись як string => робимо Number()
    const t = Number(saved.temperature_c);
    const h = Number(saved.humidity_percent);

    const violations: string[] = [];

    if (t > thresholds.temp_max) violations.push('TEMP_HIGH');
    if (t < thresholds.temp_min) violations.push('TEMP_LOW');

    if (h > thresholds.humidity_max) violations.push('HUMIDITY_HIGH');
    if (h < thresholds.humidity_min) violations.push('HUMIDITY_LOW');

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

  /**
   * UPDATE
   * - ADMIN/OWNER: може все (в межах DTO)
   * - EMPLOYEE:
   *    * може змінювати тільки вимірювання свого складу
   *    * sensor_id змінювати НЕ МОЖНА
   */
  async update(
    measurement_id: number,
    dto: UpdateMeasurementDto,
    actor_user_id: number,
    actor_role: DbRole,
  ): Promise<Measurement> {
    const m = await this.findOneWithSensor(measurement_id);

    if (actor_role === 'EMPLOYEE') {
      const actor = await this.getEmployeeActorOrThrow(actor_user_id);

      if (m.sensor.warehouse_id !== actor.warehouse_id) {
        throw new ForbiddenException(
          'You cannot update measurements from another warehouse',
        );
      }

      if (dto.sensor_id !== undefined && dto.sensor_id !== m.sensor_id) {
        throw new BadRequestException(
          'sensor_id cannot be changed by EMPLOYEE',
        );
      }
    }

    // ADMIN/OWNER може змінювати sensor_id, але тільки на сенсор, що існує
    if (actor_role !== 'EMPLOYEE' && dto.sensor_id !== undefined) {
      const nextSensor = await this.sensorRepo.findOne({
        where: { sensor_id: dto.sensor_id },
      });
      if (!nextSensor) throw new NotFoundException('Sensor not found');

      m.sensor_id = dto.sensor_id;
      // перезавантажимо relation
      m.sensor = nextSensor;
    }

    if (dto.temperature_c !== undefined) m.temperature_c = dto.temperature_c;
    if (dto.humidity_percent !== undefined)
      m.humidity_percent = dto.humidity_percent;

    if (dto.measured_at) {
      m.measured_at = new Date(dto.measured_at);
    }

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

  /**
   * DELETE
   * - ADMIN/OWNER: будь-яке
   * - EMPLOYEE: тільки зі свого складу
   */
  async remove(
    measurement_id: number,
    actor_user_id: number,
    actor_role: DbRole,
  ): Promise<void> {
    const m = await this.findOneWithSensor(measurement_id);

    if (actor_role === 'EMPLOYEE') {
      const actor = await this.getEmployeeActorOrThrow(actor_user_id);
      if (m.sensor.warehouse_id !== actor.warehouse_id) {
        throw new ForbiddenException(
          'You cannot delete measurements from another warehouse',
        );
      }
    }

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
