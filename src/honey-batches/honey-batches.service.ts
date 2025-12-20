import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { HoneyBatch } from './entities/honey-batch.entity';
import { CreateHoneyBatchDto } from './dto/create-honey-batch.dto';
import { UpdateHoneyBatchDto } from './dto/update-honey-batch.dto';

import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { User } from '../users/entities/user.entity';
import { AuditService } from '../audit/audit.service';

type DbRole = 'EMPLOYEE' | 'ADMIN' | 'OWNER';

@Injectable()
export class HoneyBatchesService {
  constructor(
    @InjectRepository(HoneyBatch)
    private readonly honeyBatchRepo: Repository<HoneyBatch>,

    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    private readonly auditService: AuditService,
  ) {}

  private async getEmployeeActorOrThrow(actor_user_id: number): Promise<User> {
    const actor = await this.userRepo.findOne({
      where: { user_id: actor_user_id },
    });
    if (!actor) throw new NotFoundException('User not found');

    if (actor.role !== 'EMPLOYEE') {
      throw new ForbiddenException('Only EMPLOYEE can perform this action');
    }

    return actor;
  }

  private requireWarehouseId(actor: User): number {
    const wid = actor.warehouse_id;
    if (wid == null) {
      throw new ForbiddenException('EMPLOYEE must be assigned to a warehouse');
    }
    return wid;
  }

  private async ensureWarehouseExists(warehouse_id: number): Promise<void> {
    const wh = await this.warehouseRepo.findOne({ where: { warehouse_id } });
    if (!wh) throw new NotFoundException('Warehouse not found');
  }

  async findAll(
    actor_user_id: number,
    actor_role: DbRole,
  ): Promise<HoneyBatch[]> {
    if (actor_role === 'EMPLOYEE') {
      const actor = await this.getEmployeeActorOrThrow(actor_user_id);
      const warehouse_id = this.requireWarehouseId(actor);

      return this.honeyBatchRepo.find({
        where: { warehouse_id },
        order: { batch_id: 'DESC' },
        relations: ['warehouse'],
      });
    }

    return this.honeyBatchRepo.find({
      order: { batch_id: 'DESC' },
      relations: ['warehouse'],
    });
  }

  async findOne(
    batch_id: number,
    actor_user_id: number,
    actor_role: DbRole,
  ): Promise<HoneyBatch> {
    const batch = await this.honeyBatchRepo.findOne({
      where: { batch_id },
      relations: ['warehouse'],
    });
    if (!batch) throw new NotFoundException('Honey batch not found');

    if (actor_role === 'EMPLOYEE') {
      const actor = await this.getEmployeeActorOrThrow(actor_user_id);
      const warehouse_id = this.requireWarehouseId(actor);

      if (batch.warehouse_id !== warehouse_id) {
        throw new ForbiddenException(
          'You cannot access batches of another warehouse',
        );
      }
    }

    return batch;
  }

  async create(
    dto: CreateHoneyBatchDto,
    actor_user_id: number,
    actor_role: DbRole,
  ): Promise<HoneyBatch> {
    if (actor_role !== 'EMPLOYEE') {
      throw new ForbiddenException('Only EMPLOYEE can create honey batches');
    }

    const actor = await this.getEmployeeActorOrThrow(actor_user_id);
    const employeeWarehouseId = this.requireWarehouseId(actor);

    await this.ensureWarehouseExists(dto.warehouse_id);

    if (dto.warehouse_id !== employeeWarehouseId) {
      throw new ForbiddenException(
        'You cannot create a batch for another warehouse',
      );
    }

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

    return saved;
  }

  async update(
    batch_id: number,
    dto: UpdateHoneyBatchDto,
    actor_user_id: number,
    actor_role: DbRole,
  ): Promise<HoneyBatch> {
    if (actor_role !== 'EMPLOYEE') {
      throw new ForbiddenException('Only EMPLOYEE can update honey batches');
    }

    const actor = await this.getEmployeeActorOrThrow(actor_user_id);
    const employeeWarehouseId = this.requireWarehouseId(actor);

    const batch = await this.honeyBatchRepo.findOne({ where: { batch_id } });
    if (!batch) throw new NotFoundException('Honey batch not found');

    if (batch.warehouse_id !== employeeWarehouseId) {
      throw new ForbiddenException(
        'You cannot update batches of another warehouse',
      );
    }

    if (
      dto.warehouse_id !== undefined &&
      dto.warehouse_id !== batch.warehouse_id
    ) {
      throw new BadRequestException('warehouse_id cannot be changed');
    }

    Object.assign(batch, dto);

    const saved = await this.honeyBatchRepo.save(batch);

    await this.auditService.log({
      actor_user_id,
      actor_role,
      action: 'UPDATE',
      entity: 'HONEY_BATCHES',
      entity_id: saved.batch_id,
      details: 'Honey batch updated',
    });

    return saved;
  }

  async remove(
    batch_id: number,
    actor_user_id: number,
    actor_role: DbRole,
  ): Promise<void> {
    if (actor_role !== 'EMPLOYEE') {
      throw new ForbiddenException('Only EMPLOYEE can delete honey batches');
    }

    const actor = await this.getEmployeeActorOrThrow(actor_user_id);
    const employeeWarehouseId = this.requireWarehouseId(actor);

    const batch = await this.honeyBatchRepo.findOne({ where: { batch_id } });
    if (!batch) throw new NotFoundException('Honey batch not found');

    if (batch.warehouse_id !== employeeWarehouseId) {
      throw new ForbiddenException(
        'You cannot delete batches of another warehouse',
      );
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
}
