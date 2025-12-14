import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeasurementsService } from './measurements.service';
import { MeasurementsController } from './measurements.controller';
import { Measurement } from './entities/measurement.entity';

import { Sensor } from '../sensors/entities/sensor.entity';
import { Threshold } from '../thresholds/entities/threshold.entity';
import { Alert } from '../alerts/entities/alert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Measurement, Sensor, Threshold, Alert])],
  controllers: [MeasurementsController],
  providers: [MeasurementsService],
  exports: [MeasurementsService],
})
export class MeasurementsModule {}
