import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeasurementsService } from './measurements.service';
import { MeasurementsController } from './measurements.controller';
import { Measurement } from './entities/measurement.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Measurement])],
  controllers: [MeasurementsController],
  providers: [MeasurementsService],
  exports: [MeasurementsService],
})
export class MeasurementsModule {}
