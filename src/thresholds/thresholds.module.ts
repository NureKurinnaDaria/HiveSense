import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Threshold } from './entities/threshold.entity';
import { ThresholdsService } from './thresholds.service';
import { ThresholdsController } from './thresholds.controller';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [TypeOrmModule.forFeature([Threshold]), AuditModule],
  controllers: [ThresholdsController],
  providers: [ThresholdsService],
})
export class ThresholdsModule {}
