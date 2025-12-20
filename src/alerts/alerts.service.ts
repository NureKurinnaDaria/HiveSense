import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Alert } from './entities/alert.entity';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';

import { AuditService } from '../audit/audit.service';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { Sensor } from '../sensors/entities/sensor.entity';
import { User } from '../users/entities/user.entity';

type DbRole = 'EMPLOYEE' | 'ADMIN' | 'OWNER';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private readonly alertRepo: Repository<Alert>,

    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,

    @InjectRepository(Sensor)
    private readonly sensorRepo: Repository<Sensor>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

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

  private async ensureWarehouseExists(warehouse_id: number): Promise<void> {
    const wh = await this.warehouseRepo.findOne({ where: { warehouse_id } });
    if (!wh) throw new NotFoundException('Warehouse not found');
  }

  private async ensureSensorValid(params: {
    warehouse_id: number;
    sensor_id: number | null;
  }): Promise<void> {
    if (params.sensor_id == null) return;

    const sensor = await this.sensorRepo.findOne({
      where: { sensor_id: params.sensor_id },
    });
    if (!sensor) throw new NotFoundException('Sensor not found');

    if (sensor.warehouse_id !== params.warehouse_id) {
      throw new BadRequestException(
        'Sensor does not belong to the specified warehouse',
      );
    }
  }

  private async getEmployeeActorOrThrow(actor_user_id: number): Promise<User> {
    const actor = await this.userRepo.findOne({
      where: { user_id: actor_user_id },
    });
    if (!actor) throw new NotFoundException('User not found');

    if (actor.role !== 'EMPLOYEE') {
      throw new ForbiddenException('Only EMPLOYEE can perform this action');
    }

    if (actor.warehouse_id == null) {
      throw new ForbiddenException('EMPLOYEE must be assigned to a warehouse');
    }

    return actor;
  }

  /**
   * CREATE
   * user_id автоматично з JWT (actor_user_id)
   * EMPLOYEE може створювати лише в межах свого складу
   */
  async create(
    dto: CreateAlertDto,
    actor_user_id: number,
    actor_role: DbRole,
  ): Promise<Alert> {
    // на випадок, якщо десь RolesGuard не спрацює
    if (actor_role !== 'EMPLOYEE') {
      throw new ForbiddenException('Only EMPLOYEE can create alerts');
    }

    const actor = await this.getEmployeeActorOrThrow(actor_user_id);

    await this.ensureWarehouseExists(dto.warehouse_id);

    // ключова перевірка: працівник НЕ може створювати для іншого складу
    if (actor.warehouse_id !== dto.warehouse_id) {
      throw new ForbiddenException(
        'You cannot create alerts for another warehouse',
      );
    }

    await this.ensureSensorValid({
      warehouse_id: dto.warehouse_id,
      sensor_id: dto.sensor_id ?? null,
    });

    const entity = this.alertRepo.create({
      type: dto.type,
      status: 'NEW',
      created_at: new Date(),
      resolved_at: null,
      warehouse_id: dto.warehouse_id,
      sensor_id: dto.sensor_id ?? null,
      user_id: actor_user_id, // ✅ тільки з JWT
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

  /**
   * UPDATE
   * EMPLOYEE може редагувати тільки тривоги свого складу
   * Дозволені зміни: type, sensor_id (узгоджено зі складом тривоги)
   */
  async update(
    alert_id: number,
    dto: UpdateAlertDto,
    actor_user_id: number,
    actor_role: DbRole,
  ): Promise<Alert> {
    if (actor_role !== 'EMPLOYEE') {
      throw new ForbiddenException('Only EMPLOYEE can update alerts');
    }

    const actor = await this.getEmployeeActorOrThrow(actor_user_id);
    const alert = await this.findOne(alert_id);

    if (actor.warehouse_id !== alert.warehouse_id) {
      throw new ForbiddenException(
        'You cannot update alerts from another warehouse',
      );
    }

    const nextSensorId =
      dto.sensor_id !== undefined ? (dto.sensor_id ?? null) : alert.sensor_id;

    await this.ensureSensorValid({
      warehouse_id: alert.warehouse_id,
      sensor_id: nextSensorId,
    });

    if (dto.type !== undefined) alert.type = dto.type;
    alert.sensor_id = nextSensorId;

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

  /**
   * DELETE
   * EMPLOYEE може видаляти тільки тривоги свого складу
   */
  async remove(
    alert_id: number,
    actor_user_id: number,
    actor_role: DbRole,
  ): Promise<void> {
    if (actor_role !== 'EMPLOYEE') {
      throw new ForbiddenException('Only EMPLOYEE can delete alerts');
    }

    const actor = await this.getEmployeeActorOrThrow(actor_user_id);
    const alert = await this.findOne(alert_id);

    if (actor.warehouse_id !== alert.warehouse_id) {
      throw new ForbiddenException(
        'You cannot delete alerts from another warehouse',
      );
    }

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

  /**
   * ACKNOWLEDGE: actor має бути EMPLOYEE цього складу
   */
  async acknowledge(
    alert_id: number,
    actor_user_id: number,
    actor_role: DbRole,
  ): Promise<Alert> {
    const alert = await this.findOne(alert_id);

    if (alert.status === 'RESOLVED') return alert;

    const actor = await this.userRepo.findOne({
      where: { user_id: actor_user_id },
    });
    if (!actor) throw new NotFoundException('User not found');

    if (actor.role !== 'EMPLOYEE') {
      throw new ForbiddenException('Only EMPLOYEE can acknowledge alerts');
    }

    if (actor.warehouse_id !== alert.warehouse_id) {
      throw new ForbiddenException(
        'Employee does not belong to alert warehouse',
      );
    }

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

  /**
   * RESOLVE: actor має бути EMPLOYEE цього складу
   */
  async resolve(
    alert_id: number,
    actor_user_id: number,
    actor_role: DbRole,
  ): Promise<Alert> {
    const alert = await this.findOne(alert_id);

    const actor = await this.userRepo.findOne({
      where: { user_id: actor_user_id },
    });
    if (!actor) throw new NotFoundException('User not found');

    if (actor.role !== 'EMPLOYEE') {
      throw new ForbiddenException('Only EMPLOYEE can resolve alerts');
    }

    if (actor.warehouse_id !== alert.warehouse_id) {
      throw new ForbiddenException(
        'Employee does not belong to alert warehouse',
      );
    }

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
