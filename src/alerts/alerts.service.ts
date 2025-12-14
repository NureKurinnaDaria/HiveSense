import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Alert } from './entities/alert.entity';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';

@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(Alert)
    private readonly alertRepo: Repository<Alert>,
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

  async create(dto: CreateAlertDto): Promise<Alert> {
    const entity = this.alertRepo.create({
      type: dto.type,
      status: 'NEW',
      created_at: new Date(),
      resolved_at: null,
      warehouse_id: dto.warehouse_id,
      sensor_id: dto.sensor_id ?? null,
      user_id: dto.user_id ?? null,
    });

    return this.alertRepo.save(entity);
  }

  async update(alert_id: number, dto: UpdateAlertDto): Promise<Alert> {
    const alert = await this.findOne(alert_id);

    Object.assign(alert, dto);

    return this.alertRepo.save(alert);
  }

  async remove(alert_id: number): Promise<void> {
    const alert = await this.findOne(alert_id);
    await this.alertRepo.remove(alert);
  }

  async acknowledge(alert_id: number, user_id: number): Promise<Alert> {
    const alert = await this.findOne(alert_id);

    if (alert.status === 'RESOLVED') return alert;

    alert.status = 'ACKNOWLEDGED';
    alert.user_id = user_id;

    return this.alertRepo.save(alert);
  }

  async resolve(alert_id: number, user_id: number): Promise<Alert> {
    const alert = await this.findOne(alert_id);

    alert.status = 'RESOLVED';
    alert.user_id = user_id;
    alert.resolved_at = new Date();

    return this.alertRepo.save(alert);
  }
}
