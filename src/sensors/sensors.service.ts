import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sensor } from './entities/sensor.entity';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';

@Injectable()
export class SensorsService {
  constructor(
    @InjectRepository(Sensor)
    private readonly sensorRepo: Repository<Sensor>,
  ) {}

  async findAll(): Promise<Sensor[]> {
    return this.sensorRepo.find({
      order: { sensor_id: 'DESC' },
      relations: ['warehouse'],
    });
  }

  async findOne(sensor_id: number): Promise<Sensor> {
    const sensor = await this.sensorRepo.findOne({
      where: { sensor_id },
      relations: ['warehouse'],
    });
    if (!sensor) throw new NotFoundException('Sensor not found');
    return sensor;
  }

  async create(dto: CreateSensorDto): Promise<Sensor> {
    const entity = this.sensorRepo.create({
      serial_number: dto.serial_number,
      type: dto.type,
      is_active: dto.is_active ?? true,
      warehouse_id: dto.warehouse_id,
    });

    return this.sensorRepo.save(entity);
  }

  async update(sensor_id: number, dto: UpdateSensorDto): Promise<Sensor> {
    const sensor = await this.findOne(sensor_id);
    Object.assign(sensor, dto);
    return this.sensorRepo.save(sensor);
  }

  async remove(sensor_id: number): Promise<void> {
    const sensor = await this.findOne(sensor_id);
    await this.sensorRepo.remove(sensor);
  }
}
