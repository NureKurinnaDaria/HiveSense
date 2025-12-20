import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AlertsService } from './alerts.service';
import { AlertsController } from './alerts.controller';
import { Alert } from './entities/alert.entity';

import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { Sensor } from '../sensors/entities/sensor.entity';
import { User } from '../users/entities/user.entity';

import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Alert, Warehouse, Sensor, User]),
    AuditModule,
  ],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}
