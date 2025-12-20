import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'BLOCK'
  | 'UNBLOCK'
  | 'ROLE_CHANGE'
  | 'LOGIN';

export type AuditEntity =
  | 'USERS'
  | 'WAREHOUSES'
  | 'THRESHOLDS'
  | 'MEASUREMENTS'
  | 'ALERTS'
  | 'HONEY_BATCHES';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  private startOfDay(dateStr: string): Date {
    return new Date(`${dateStr}T00:00:00.000`);
  }

  private endOfDay(dateStr: string): Date {
    return new Date(`${dateStr}T23:59:59.999`);
  }

  async log(params: {
    actor_user_id: number;
    actor_role: string;
    action: AuditAction;
    entity: AuditEntity;
    entity_id?: number | null;
    details?: string | null;
  }): Promise<void> {
    if (!params.actor_user_id) {
      throw new BadRequestException('actor_user_id is required for audit log');
    }

    const row = this.auditRepo.create({
      actor_user_id: params.actor_user_id,
      actor_role: params.actor_role,
      action: params.action,
      entity: params.entity,
      entity_id: params.entity_id ?? null,
      details: params.details ?? null,
    });

    await this.auditRepo.save(row);
  }

  async findAll(filters?: {
    entity?: string;
    action?: string;
    from?: string;
    to?: string;
  }) {
    const qb = this.auditRepo
      .createQueryBuilder('a')
      .orderBy('a.created_at', 'DESC');

    if (filters?.entity) {
      qb.andWhere('a.entity = :entity', { entity: filters.entity });
    }

    if (filters?.action) {
      qb.andWhere('a.action = :action', { action: filters.action });
    }

    if (filters?.from) {
      qb.andWhere('a.created_at >= :from', {
        from: this.startOfDay(filters.from),
      });
    }

    if (filters?.to) {
      qb.andWhere('a.created_at <= :to', { to: this.endOfDay(filters.to) });
    }

    return qb.getMany();
  }
}
