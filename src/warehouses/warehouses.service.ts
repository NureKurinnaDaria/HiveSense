import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './entities/warehouse.entity';

@Injectable()
export class WarehousesService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
  ) {}

  async findAll(): Promise<Warehouse[]> {
    return this.warehouseRepo.find({
      order: { warehouse_id: 'DESC' },
      relations: ['users', 'sensors', 'honey_batches', 'alerts'],
    });
  }

  async findOne(warehouse_id: number): Promise<Warehouse> {
    const wh = await this.warehouseRepo.findOne({
      where: { warehouse_id },
      relations: ['users', 'sensors', 'honey_batches', 'alerts'],
    });
    if (!wh) throw new NotFoundException('Warehouse not found');
    return wh;
  }

  async create(dto: Partial<Warehouse>): Promise<Warehouse> {
    const entity = this.warehouseRepo.create({
      name: dto.name,
      location: dto.location,
      status: dto.status ?? 'ACTIVE',
    });

    return this.warehouseRepo.save(entity);
  }

  async update(
    warehouse_id: number,
    dto: Partial<Warehouse>,
  ): Promise<Warehouse> {
    const wh = await this.findOne(warehouse_id);

    if (dto.name !== undefined) wh.name = dto.name;
    if (dto.location !== undefined) wh.location = dto.location;
    if (dto.status !== undefined) wh.status = dto.status;

    return this.warehouseRepo.save(wh);
  }

  async remove(warehouse_id: number): Promise<void> {
    const wh = await this.findOne(warehouse_id);
    await this.warehouseRepo.remove(wh);
  }
}
