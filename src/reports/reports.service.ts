import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { Sensor } from '../sensors/entities/sensor.entity';
import { Measurement } from '../measurements/entities/measurement.entity';
import { Alert } from '../alerts/entities/alert.entity';
import { Threshold } from '../thresholds/entities/threshold.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
    @InjectRepository(Sensor)
    private readonly sensorRepo: Repository<Sensor>,
    @InjectRepository(Measurement)
    private readonly measurementRepo: Repository<Measurement>,
    @InjectRepository(Alert)
    private readonly alertRepo: Repository<Alert>,
    @InjectRepository(Threshold)
    private readonly thresholdRepo: Repository<Threshold>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getWarehouseSummary(warehouse_id: number) {
    const warehouse = await this.warehouseRepo.findOne({
      where: { warehouse_id },
    });
    if (!warehouse) throw new NotFoundException('Warehouse not found');

    const sensorsCount = await this.sensorRepo.count({
      where: { warehouse_id },
    });

    const measurementsCount = await this.measurementRepo
      .createQueryBuilder('m')
      .innerJoin(Sensor, 's', 's.sensor_id = m.sensor_id')
      .where('s.warehouse_id = :warehouse_id', { warehouse_id })
      .getCount();

    const alertsNew = await this.alertRepo.count({
      where: { warehouse_id, status: 'NEW' },
    });
    const alertsAck = await this.alertRepo.count({
      where: { warehouse_id, status: 'ACKNOWLEDGED' },
    });
    const alertsResolved = await this.alertRepo.count({
      where: { warehouse_id, status: 'RESOLVED' },
    });

    const threshold = await this.thresholdRepo.findOne({
      where: { warehouse_id },
    });

    const totalEmployees = await this.userRepo.count({
      where: { warehouse_id, role: 'EMPLOYEE' },
    });
    const activeEmployees = await this.userRepo.count({
      where: { warehouse_id, role: 'EMPLOYEE', is_active: true },
    });

    return {
      warehouse: {
        id: warehouse.warehouse_id,
        name: warehouse.name,
        location: warehouse.location,
        status: warehouse.status,
      },
      employees: {
        total: totalEmployees,
        active: activeEmployees,
        blocked: totalEmployees - activeEmployees,
      },
      sensors: sensorsCount,
      measurements: measurementsCount,
      alerts: {
        NEW: alertsNew,
        ACKNOWLEDGED: alertsAck,
        RESOLVED: alertsResolved,
      },
      thresholdsConfigured: Boolean(threshold),
    };
  }
}
