import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensorsService } from './sensors.service';
import { SensorsController } from './sensors.controller';
import { Sensor } from './entities/sensor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sensor])],
  controllers: [SensorsController],
  providers: [SensorsService],
  exports: [SensorsService],
})
export class SensorsModule {}
