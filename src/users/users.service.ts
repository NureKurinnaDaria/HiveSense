import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { CreateUserDto } from './dto/create-user';
import { UpdateUserDto } from './dto/update-user';
import { AuditService } from '../audit/audit.service';

type InputRole = 'worker' | 'admin' | 'owner';
type DbRole = 'EMPLOYEE' | 'ADMIN' | 'OWNER';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
    private readonly auditService: AuditService,
  ) {}

  private mapRoleToDb(role: InputRole): DbRole {
    switch (role) {
      case 'worker':
        return 'EMPLOYEE';
      case 'admin':
        return 'ADMIN';
      case 'owner':
        return 'OWNER';
      default:
        throw new BadRequestException('Invalid role value');
    }
  }

  async findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find({
      order: { user_id: 'DESC' },
      relations: ['warehouse'],
    });
  }

  async findOne(user_id: number): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { user_id },
      relations: ['warehouse'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async createByActor(
    dto: CreateUserDto,
    actor_user_id: number,
    actor_role: DbRole,
  ) {
    const dbRole = this.mapRoleToDb(dto.role as InputRole);

    if (dbRole === 'EMPLOYEE') {
      if (dto.warehouse_id == null) {
        throw new BadRequestException('warehouse_id is required for EMPLOYEE');
      }
      const wh = await this.warehouseRepo.findOne({
        where: { warehouse_id: dto.warehouse_id },
      });
      if (!wh) {
        throw new BadRequestException('Warehouse not found for warehouse_id');
      }
    }

    const entity = this.userRepo.create({
      email: dto.email,
      password: await bcrypt.hash(dto.password, 10),
      full_name: dto.name,
      role: dbRole,
      is_active: dto.is_active,
      warehouse_id: dbRole === 'EMPLOYEE' ? dto.warehouse_id : null,
    });

    const saved = await this.userRepo.save(entity);

    await this.auditService.log({
      actor_user_id,
      actor_role,
      action: 'CREATE',
      entity: 'USERS',
      entity_id: saved.user_id,
      details: `User created (role: ${saved.role})`,
    });

    return saved;
  }

  async updateByActor(
    user_id: number,
    dto: UpdateUserDto,
    actor_user_id: number,
    actor_role: DbRole,
  ): Promise<User> {
    const user = await this.findOne(user_id);

    // warehouse_id
    if (dto.warehouse_id !== undefined) {
      if (dto.warehouse_id === null) {
        user.warehouse_id = null;
      } else {
        const wh = await this.warehouseRepo.findOne({
          where: { warehouse_id: dto.warehouse_id as any },
        });
        if (!wh) {
          throw new BadRequestException('Warehouse not found for warehouse_id');
        }
        user.warehouse_id = dto.warehouse_id as any;
      }
    }

    if (dto.email !== undefined) user.email = dto.email;
    if (dto.name !== undefined) user.full_name = dto.name;
    if (dto.is_active !== undefined) user.is_active = dto.is_active;

    if ((dto as any).password !== undefined) {
      user.password = await bcrypt.hash((dto as any).password, 10);
    }

    if (user.role !== 'EMPLOYEE') user.warehouse_id = null;

    if (user.role === 'EMPLOYEE' && user.warehouse_id == null) {
      throw new BadRequestException('EMPLOYEE must be assigned to a warehouse');
    }

    const saved = await this.userRepo.save(user);

    await this.auditService.log({
      actor_user_id,
      actor_role,
      action: 'UPDATE',
      entity: 'USERS',
      entity_id: saved.user_id,
      details: 'User updated',
    });

    return saved;
  }

  async setActiveByActor(params: {
    target_user_id: number;
    active: boolean;
    actor_user_id: number;
    actor_role: DbRole;
  }): Promise<User> {
    const target = await this.findOne(params.target_user_id);

    if (params.actor_role === 'ADMIN' && target.role === 'OWNER') {
      throw new ForbiddenException('ADMIN cannot change OWNER status');
    }

    target.is_active = params.active;
    const saved = await this.userRepo.save(target);

    await this.auditService.log({
      actor_user_id: params.actor_user_id,
      actor_role: params.actor_role,
      action: params.active ? 'UNBLOCK' : 'BLOCK',
      entity: 'USERS',
      entity_id: target.user_id,
      details: params.active ? 'User unblocked' : 'User blocked',
    });

    return saved;
  }

  async removeByActor(params: {
    target_user_id: number;
    actor_user_id: number;
    actor_role: DbRole;
  }): Promise<void> {
    const target = await this.findOne(params.target_user_id);

    if (params.actor_role === 'ADMIN' && target.role === 'OWNER') {
      throw new ForbiddenException('ADMIN cannot delete OWNER');
    }

    await this.userRepo.remove(target);

    await this.auditService.log({
      actor_user_id: params.actor_user_id,
      actor_role: params.actor_role,
      action: 'DELETE',
      entity: 'USERS',
      entity_id: params.target_user_id,
      details: `User deleted (target role: ${target.role})`,
    });
  }
}
