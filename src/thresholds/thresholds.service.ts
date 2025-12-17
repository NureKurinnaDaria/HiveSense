import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Threshold } from './entities/threshold.entity';
import { CreateThresholdDto } from './dto/create-threshold.dto';
import { UpdateThresholdDto } from './dto/update-threshold.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ThresholdsService {
  constructor(
    @InjectRepository(Threshold)
    private readonly thresholdRepo: Repository<Threshold>,

    private readonly auditService: AuditService,
  ) {}

  async findAll(): Promise<Threshold[]> {
    return this.thresholdRepo.find({
      order: { threshold_id: 'DESC' },
      relations: ['warehouse'],
    });
  }

  async findByWarehouse(warehouse_id: number): Promise<Threshold> {
    const t = await this.thresholdRepo.findOne({
      where: { warehouse_id },
      relations: ['warehouse'],
    });
    if (!t) throw new NotFoundException('Thresholds for warehouse not found');
    return t;
  }

  async create(
    dto: CreateThresholdDto,
    actor_user_id: number,
    actor_role: string,
  ): Promise<Threshold> {
    if (dto.temp_min >= dto.temp_max) {
      throw new BadRequestException('temp_min must be < temp_max');
    }
    if (dto.humidity_min >= dto.humidity_max) {
      throw new BadRequestException('humidity_min must be < humidity_max');
    }

    const existing = await this.thresholdRepo.findOne({
      where: { warehouse_id: dto.warehouse_id },
    });
    if (existing) {
      throw new BadRequestException(
        'Thresholds already exist for this warehouse. Use update.',
      );
    }

    const entity = this.thresholdRepo.create({
      ...dto,
      updated_at: new Date(),
    });

    const saved = await this.thresholdRepo.save(entity);

    // AUDIT: CREATE THRESHOLDS
    await this.auditService.log({
      actor_user_id,
      actor_role,
      action: 'CREATE',
      entity: 'THRESHOLDS',
      entity_id: saved.threshold_id,
      details: `Created thresholds for warehouse_id=${saved.warehouse_id}`,
    });

    return saved;
  }

  async updateByWarehouse(
    warehouse_id: number,
    dto: UpdateThresholdDto,
    actor_user_id: number,
    actor_role: string,
  ): Promise<Threshold> {
    const t = await this.findByWarehouse(warehouse_id);

    const next = {
      temp_min: dto.temp_min ?? t.temp_min,
      temp_max: dto.temp_max ?? t.temp_max,
      humidity_min: dto.humidity_min ?? t.humidity_min,
      humidity_max: dto.humidity_max ?? t.humidity_max,
    };

    if (next.temp_min >= next.temp_max) {
      throw new BadRequestException('temp_min must be < temp_max');
    }
    if (next.humidity_min >= next.humidity_max) {
      throw new BadRequestException('humidity_min must be < humidity_max');
    }

    Object.assign(t, next, { updated_at: new Date() });

    const saved = await this.thresholdRepo.save(t);

    // AUDIT: UPDATE THRESHOLDS
    await this.auditService.log({
      actor_user_id,
      actor_role,
      action: 'UPDATE',
      entity: 'THRESHOLDS',
      entity_id: saved.threshold_id,
      details: `Updated thresholds for warehouse_id=${warehouse_id}`,
    });

    return saved;
  }

  async removeByWarehouse(
    warehouse_id: number,
    actor_user_id: number,
    actor_role: string,
  ): Promise<void> {
    const t = await this.findByWarehouse(warehouse_id);

    await this.thresholdRepo.remove(t);

    // AUDIT: DELETE THRESHOLDS
    await this.auditService.log({
      actor_user_id,
      actor_role,
      action: 'DELETE',
      entity: 'THRESHOLDS',
      entity_id: t.threshold_id,
      details: `Deleted thresholds for warehouse_id=${warehouse_id}`,
    });
  }
}
