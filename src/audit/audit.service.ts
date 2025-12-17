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
  | 'ALERTS';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepo: Repository<AuditLog>,
  ) {}

  // щоб date-only фільтри працювали "в межах дня"
  private startOfDay(dateStr: string): Date {
    // local time: YYYY-MM-DDT00:00:00.000
    return new Date(`${dateStr}T00:00:00.000`);
  }

  private endOfDay(dateStr: string): Date {
    // local time: YYYY-MM-DDT23:59:59.999
    return new Date(`${dateStr}T23:59:59.999`);
  }

  // записати подію в audit_logs
  async log(params: {
    actor_user_id: number;
    actor_role: string; // ADMIN / OWNER / EMPLOYEE
    action: AuditAction;
    entity: AuditEntity;
    entity_id?: number | null;
    details?: string | null;
  }): Promise<void> {
    // захист від падіння БД через NOT NULL
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

  // отримати події з фільтрами
  async findAll(filters?: {
    entity?: string;
    action?: string;
    from?: string; // YYYY-MM-DD
    to?: string; // YYYY-MM-DD
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

    // правильна логіка дат
    if (filters?.from) {
      qb.andWhere('a.created_at >= :from', {
        from: this.startOfDay(filters.from),
      });
    }

    if (filters?.to) {
      qb.andWhere('a.created_at <= :to', {
        to: this.endOfDay(filters.to),
      });
    }

    return qb.getMany();
  }
}
