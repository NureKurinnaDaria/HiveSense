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

  async create(dto: CreateMeasurementDto): Promise<Measurement> {
    // Валідація базової логіки
    if (dto.temperature_c === undefined || dto.humidity_percent === undefined) {
      throw new BadRequestException(
        'temperature_c and humidity_percent are required',
      );
    }

    // Знаходимо сенсор → склад
    const sensor = await this.sensorRepo.findOne({
      where: { sensor_id: dto.sensor_id },
    });
    if (!sensor) throw new NotFoundException('Sensor not found');

    const warehouse_id = sensor.warehouse_id;

    // Зберігаємо вимірювання
    const measuredAt = dto.measured_at ? new Date(dto.measured_at) : new Date();

    const measurement = this.measurementRepo.create({
      measured_at: measuredAt,
      temperature_c: dto.temperature_c,
      humidity_percent: dto.humidity_percent,
      sensor_id: dto.sensor_id,
    });

    const saved = await this.measurementRepo.save(measurement);

    // Беремо пороги (thresholds) для складу
    const thresholds = await this.thresholdRepo.findOne({
      where: { warehouse_id },
    });

    // Якщо адмін ще не налаштував пороги — бізнес-логіка не спрацьовує
    if (!thresholds) return saved;

    // Визначаємо типи порушень
    const violations: string[] = [];

    if (saved.temperature_c > thresholds.temp_max) violations.push('TEMP_HIGH');
    if (saved.temperature_c < thresholds.temp_min) violations.push('TEMP_LOW');

    if (saved.humidity_percent > thresholds.humidity_max)
      violations.push('HUMIDITY_HIGH');
    if (saved.humidity_percent < thresholds.humidity_min)
      violations.push('HUMIDITY_LOW');

    // Антидубль: створюємо NEW лише якщо такого NEW ще нема
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

        await this.alertRepo.save(alert);
      }
    }

    // Нормалізація по типах:
    //    якщо параметр став нормальним — закриваємо тільки відповідні alerts (NEW)
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
          await this.alertRepo.save(a);
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
          await this.alertRepo.save(a);
        }
      }
    }

    return saved;
  }

  async update(
    measurement_id: number,
    dto: UpdateMeasurementDto,
  ): Promise<Measurement> {
    const m = await this.findOne(measurement_id);

    Object.assign(m, {
      ...dto,
      measured_at: dto.measured_at ? new Date(dto.measured_at) : m.measured_at,
    });

    return this.measurementRepo.save(m);
  }

  async remove(measurement_id: number): Promise<void> {
    const m = await this.findOne(measurement_id);
    await this.measurementRepo.remove(m);
  }
}
