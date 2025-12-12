import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Measurement } from './entities/measurement.entity';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { UpdateMeasurementDto } from './dto/update-measurement.dto';

@Injectable()
export class MeasurementsService {
  constructor(
    @InjectRepository(Measurement)
    private readonly measurementRepo: Repository<Measurement>,
  ) {}

  async findAll(): Promise<Measurement[]> {
    return this.measurementRepo.find({
      order: { measurement_id: 'DESC' },
      relations: ['sensor'],
    });
  }

  async findOne(measurement_id: number): Promise<Measurement> {
    const m = await this.measurementRepo.findOne({
      where: { measurement_id },
      relations: ['sensor'],
    });
    if (!m) throw new NotFoundException('Measurement not found');
    return m;
  }

  async create(dto: CreateMeasurementDto): Promise<Measurement> {
    const entity = this.measurementRepo.create({
      measured_at: new Date(dto.measured_at),
      temperature_c: dto.temperature_c,
      humidity_percent: dto.humidity_percent,
      sensor_id: dto.sensor_id,
    });

    return this.measurementRepo.save(entity);
  }

  async update(
    measurement_id: number,
    dto: UpdateMeasurementDto,
  ): Promise<Measurement> {
    const m = await this.findOne(measurement_id);

    Object.assign(m, {
      ...dto,
      measured_at: dto.measured_at ? new Date(dto.measured_at) : m.measured_at,
    });

    return this.measurementRepo.save(m);
  }

  async remove(measurement_id: number): Promise<void> {
    const m = await this.findOne(measurement_id);
    await this.measurementRepo.remove(m);
  }
}
