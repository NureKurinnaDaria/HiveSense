import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HoneyBatchesService } from './honey-batches.service';
import { HoneyBatchesController } from './honey-batches.controller';

import { HoneyBatch } from './entities/honey-batch.entity';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { User } from '../users/entities/user.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([HoneyBatch, Warehouse, User]),
    AuditModule,
  ],
  controllers: [HoneyBatchesController],
  providers: [HoneyBatchesService],
  exports: [HoneyBatchesService],
})
export class HoneyBatchesModule {}
