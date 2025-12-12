import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HoneyBatchesService } from './honey-batches.service';
import { HoneyBatchesController } from './honey-batches.controller';
import { HoneyBatch } from './entities/honey-batch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HoneyBatch])],
  controllers: [HoneyBatchesController],
  providers: [HoneyBatchesService],
  exports: [HoneyBatchesService],
})
export class HoneyBatchesModule {}
