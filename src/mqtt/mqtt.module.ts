import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MqttService } from './mqtt.service';

import { Sensor } from '../sensors/entities/sensor.entity';
import { Measurement } from '../measurements/entities/measurement.entity';
import { Threshold } from '../thresholds/entities/threshold.entity';
import { Alert } from '../alerts/entities/alert.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sensor, Measurement, Threshold, Alert]),
    NotificationsModule,
  ],
  providers: [MqttService],
  exports: [MqttService],
})
export class MqttModule {}
