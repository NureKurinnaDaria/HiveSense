import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HoneyBatch } from './entities/honey-batch.entity';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { CreateHoneyBatchDto } from './dto/create-honey-batch.dto';
import { UpdateHoneyBatchDto } from './dto/update-honey-batch.dto';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';

type DbRole = 'ADMIN' | 'OWNER' | 'EMPLOYEE';

@Injectable()
export class HoneyBatchesService {
  constructor(
    @InjectRepository(HoneyBatch)
    private readonly honeyBatchRepo: Repository<HoneyBatch>,

    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,

    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
  ) {}

  // Return all batches for ADMIN / OWNER, and only own warehouse batches for EMPLOYEE.
  async findAll(
    actor_user_id: number,
    actor_role: DbRole,
  ): Promise<HoneyBatch[]> {
    if (actor_role === 'ADMIN' || actor_role === 'OWNER') {
      return this.honeyBatchRepo.find({
        order: { batch_id: 'DESC' },
        relations: ['warehouse'],
      });
    }

    if (actor_role === 'EMPLOYEE') {
      const user = await this.usersService.findOne(actor_user_id);

      if (!user.warehouse_id) {
        return [];
      }

      return this.honeyBatchRepo.find({
        where: { warehouse_id: user.warehouse_id },
        order: { batch_id: 'DESC' },
        relations: ['warehouse'],
      });
    }

    throw new ForbiddenException('Forbidden');
  }

  // Return one batch. EMPLOYEE can open only a batch from own warehouse.
  async findOne(
    batch_id: number,
    actor_user_id: number,
    actor_role: DbRole,
  ): Promise<HoneyBatch> {
    const batch = await this.honeyBatchRepo.findOne({
      where: { batch_id },
      relations: ['warehouse'],
    });

    if (!batch) {
      throw new NotFoundException('Honey batch not found');
    }

    if (actor_role === 'ADMIN' || actor_role === 'OWNER') {
      return batch;
    }

    if (actor_role === 'EMPLOYEE') {
      const user = await this.usersService.findOne(actor_user_id);

      if (!user.warehouse_id || batch.warehouse_id !== user.warehouse_id) {
        throw new ForbiddenException(
          'You can view only honey batches from your warehouse',
        );
      }

      return batch;
    }

    throw new ForbiddenException('Forbidden');
  }

  // Only ADMIN can create honey batches.
  async create(
    dto: CreateHoneyBatchDto,
    actor_user_id: number,
    actor_role: DbRole,
  ): Promise<HoneyBatch> {
    if (actor_role !== 'ADMIN') {
      throw new ForbiddenException('Only ADMIN can create honey batches');
    }

    await this.ensureWarehouseExists(dto.warehouse_id);

    const entity = this.honeyBatchRepo.create({
      variety: dto.variety,
      quantity_kg: dto.quantity_kg,
      received_date: dto.received_date,
      expiration_date: dto.expiration_date ?? null,
      status: dto.status ?? 'ACTIVE',
      warehouse_id: dto.warehouse_id,
    });

    const saved = await this.honeyBatchRepo.save(entity);

    await this.auditService.log({
      actor_user_id,
      actor_role,
      action: 'CREATE',
      entity: 'HONEY_BATCHES',
      entity_id: saved.batch_id,
      details: `Created honey batch variety=${saved.variety} warehouse_id=${saved.warehouse_id}`,
    });

    return this.findOne(saved.batch_id, actor_user_id, actor_role);
  }

  // Only ADMIN can update honey batches.
  async update(
    batch_id: number,
    dto: UpdateHoneyBatchDto,
    actor_user_id: number,
    actor_role: DbRole,
  ): Promise<HoneyBatch> {
    if (actor_role !== 'ADMIN') {
      throw new ForbiddenException('Only ADMIN can update honey batches');
    }

    const batch = await this.honeyBatchRepo.findOne({
      where: { batch_id },
    });

    if (!batch) {
      throw new NotFoundException('Honey batch not found');
    }

    // Do not allow moving batch to another warehouse through update.
    if (
      dto.warehouse_id !== undefined &&
      dto.warehouse_id !== batch.warehouse_id
    ) {
      throw new BadRequestException('warehouse_id cannot be changed');
    }

    if (dto.variety !== undefined) {
      batch.variety = dto.variety;
    }

    if (dto.quantity_kg !== undefined) {
      batch.quantity_kg = dto.quantity_kg;
    }

    if (dto.received_date !== undefined) {
      batch.received_date = dto.received_date;
    }

    if (dto.expiration_date !== undefined) {
      batch.expiration_date = dto.expiration_date;
    }

    if (dto.status !== undefined) {
      batch.status = dto.status;
    }

    const saved = await this.honeyBatchRepo.save(batch);

    await this.auditService.log({
      actor_user_id,
      actor_role,
      action: 'UPDATE',
      entity: 'HONEY_BATCHES',
      entity_id: saved.batch_id,
      details: 'Honey batch updated',
    });

    return this.findOne(saved.batch_id, actor_user_id, actor_role);
  }

  // Only ADMIN can delete honey batches.
  async remove(
    batch_id: number,
    actor_user_id: number,
    actor_role: DbRole,
  ): Promise<void> {
    if (actor_role !== 'ADMIN') {
      throw new ForbiddenException('Only ADMIN can delete honey batches');
    }

    const batch = await this.honeyBatchRepo.findOne({
      where: { batch_id },
    });

    if (!batch) {
      throw new NotFoundException('Honey batch not found');
    }

    await this.honeyBatchRepo.remove(batch);

    await this.auditService.log({
      actor_user_id,
      actor_role,
      action: 'DELETE',
      entity: 'HONEY_BATCHES',
      entity_id: batch_id,
      details: 'Honey batch deleted',
    });
  }

  // Validate warehouse existence before creating a batch.
  private async ensureWarehouseExists(warehouse_id: number): Promise<void> {
    const warehouse = await this.warehouseRepo.findOne({
      where: { warehouse_id },
    });

    if (!warehouse) {
      throw new BadRequestException('Warehouse not found');
    }
  }
}
