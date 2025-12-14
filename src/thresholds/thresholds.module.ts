import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Threshold } from './entities/threshold.entity';
import { ThresholdsService } from './thresholds.service';
import { ThresholdsController } from './thresholds.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Threshold])],
  controllers: [ThresholdsController],
  providers: [ThresholdsService],
  exports: [ThresholdsService], // знадобиться для MeasurementsService
})
export class ThresholdsModule {}
