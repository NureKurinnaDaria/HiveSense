import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './entities/alert.entity';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { AuditService } from '../audit/audit.service';

type DbRole = 'EMPLOYEE' | 'ADMIN' | 'OWNER';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private readonly alertRepo: Repository<Alert>,
    private readonly auditService: AuditService,
  ) {}

  async findAll(): Promise<Alert[]> {
    return this.alertRepo.find({
      order: { alert_id: 'DESC' },
      relations: ['warehouse', 'sensor', 'user'],
    });
  }

  async findOne(alert_id: number): Promise<Alert> {
    const alert = await this.alertRepo.findOne({
      where: { alert_id },
      relations: ['warehouse', 'sensor', 'user'],
    });
    if (!alert) throw new NotFoundException('Alert not found');
    return alert;
  }

  async create(
    dto: CreateAlertDto,
    actor_user_id: number,
    actor_role: DbRole,
  ): Promise<Alert> {
    const entity = this.alertRepo.create({
      type: dto.type,
      status: 'NEW',
      created_at: new Date(),
      resolved_at: null,
      warehouse_id: dto.warehouse_id,
      sensor_id: dto.sensor_id ?? null,
      user_id: dto.user_id ?? actor_user_id ?? null, // якщо не передали, привʼязуємо до актора
    });

    const saved = await this.alertRepo.save(entity);

    await this.auditService.log({
      actor_user_id,
      actor_role,
      action: 'CREATE',
      entity: 'ALERTS',
      entity_id: saved.alert_id,
      details: `Created alert type=${saved.type} for warehouse_id=${saved.warehouse_id}`,
    });

    return saved;
  }

  async update(
    alert_id: number,
    dto: UpdateAlertDto,
    actor_user_id: number,
    actor_role: DbRole,
  ): Promise<Alert> {
    const alert = await this.findOne(alert_id);

    Object.assign(alert, dto);

    const saved = await this.alertRepo.save(alert);

    await this.auditService.log({
      actor_user_id,
      actor_role,
      action: 'UPDATE',
      entity: 'ALERTS',
      entity_id: saved.alert_id,
      details: 'Alert updated',
    });

    return saved;
  }

  async remove(
    alert_id: number,
    actor_user_id: number,
    actor_role: DbRole,
  ): Promise<void> {
    const alert = await this.findOne(alert_id);
    await this.alertRepo.remove(alert);

    await this.auditService.log({
      actor_user_id,
      actor_role,
      action: 'DELETE',
      entity: 'ALERTS',
      entity_id: alert_id,
      details: 'Alert deleted',
    });
  }

  async acknowledge(
    alert_id: number,
    actor_user_id: number,
    actor_role: DbRole,
  ): Promise<Alert> {
    const alert = await this.findOne(alert_id);

    if (alert.status === 'RESOLVED') return alert;

    alert.status = 'ACKNOWLEDGED';
    alert.user_id = actor_user_id;

    const saved = await this.alertRepo.save(alert);

    await this.auditService.log({
      actor_user_id,
      actor_role,
      action: 'UPDATE',
      entity: 'ALERTS',
      entity_id: saved.alert_id,
      details: 'Alert acknowledged',
    });

    return saved;
  }

  async resolve(
    alert_id: number,
    actor_user_id: number,
    actor_role: DbRole,
  ): Promise<Alert> {
    const alert = await this.findOne(alert_id);

    alert.status = 'RESOLVED';
    alert.user_id = actor_user_id;
    alert.resolved_at = new Date();

    const saved = await this.alertRepo.save(alert);

    await this.auditService.log({
      actor_user_id,
      actor_role,
      action: 'UPDATE',
      entity: 'ALERTS',
      entity_id: saved.alert_id,
      details: 'Alert resolved',
    });

    return saved;
  }
}
