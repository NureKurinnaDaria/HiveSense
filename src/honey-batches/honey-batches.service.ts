import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HoneyBatch } from './entities/honey-batch.entity';
import { CreateHoneyBatchDto } from './dto/create-honey-batch.dto';
import { UpdateHoneyBatchDto } from './dto/update-honey-batch.dto';

@Injectable()
export class HoneyBatchesService {
  constructor(
    @InjectRepository(HoneyBatch)
    private readonly honeyBatchRepo: Repository<HoneyBatch>,
  ) {}

  async findAll(): Promise<HoneyBatch[]> {
    return this.honeyBatchRepo.find({
      order: { batch_id: 'DESC' },
      relations: ['warehouse'],
    });
  }

  async findOne(batch_id: number): Promise<HoneyBatch> {
    const batch = await this.honeyBatchRepo.findOne({
      where: { batch_id },
      relations: ['warehouse'],
    });
    if (!batch) throw new NotFoundException('Honey batch not found');
    return batch;
  }

  async create(dto: CreateHoneyBatchDto): Promise<HoneyBatch> {
    const entity = this.honeyBatchRepo.create({
      variety: dto.variety,
      quantity_kg: dto.quantity_kg,
      received_date: dto.received_date,
      expiration_date: dto.expiration_date ?? null,
      status: dto.status ?? 'ACTIVE',
      warehouse_id: dto.warehouse_id,
    });

    return this.honeyBatchRepo.save(entity);
  }

  async update(
    batch_id: number,
    dto: UpdateHoneyBatchDto,
  ): Promise<HoneyBatch> {
    const batch = await this.findOne(batch_id);
    Object.assign(batch, dto);
    return this.honeyBatchRepo.save(batch);
  }

  async remove(batch_id: number): Promise<void> {
    const batch = await this.findOne(batch_id);
    await this.honeyBatchRepo.remove(batch);
  }
}
