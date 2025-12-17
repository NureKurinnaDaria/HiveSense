import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { Sensor } from '../sensors/entities/sensor.entity';
import { Measurement } from '../measurements/entities/measurement.entity';
import { Alert } from '../alerts/entities/alert.entity';
import { Threshold } from '../thresholds/entities/threshold.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Warehouse,
      Sensor,
      Measurement,
      Alert,
      Threshold,
      User,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
