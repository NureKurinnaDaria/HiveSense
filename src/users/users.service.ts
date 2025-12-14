import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Warehouse } from '../warehouses/entities/warehouse.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Warehouse)
    private readonly warehouseRepo: Repository<Warehouse>,
  ) {}

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

  async create(dto: CreateUserDto): Promise<User> {
    // якщо передали warehouse_id — перевіряємо що склад існує
    if (dto.warehouse_id != null) {
      const wh = await this.warehouseRepo.findOne({
        where: { warehouse_id: dto.warehouse_id },
      });
      if (!wh) {
        throw new BadRequestException('Warehouse not found for warehouse_id');
      }
    }

    const entity = this.userRepo.create({
      email: dto.email,
      password: dto.password,
      full_name: dto.name, // мапимо name -> full_name
      role: dto.role, // залишаємо як у DTO (worker/admin/owner)
      is_active: dto.is_active,
      warehouse_id: dto.warehouse_id ?? null,
    });

    return this.userRepo.save(entity);
  }

  async update(user_id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(user_id);

    if (dto.warehouse_id !== undefined) {
      if (dto.warehouse_id === null) {
        user.warehouse_id = null;
      } else {
        const wh = await this.warehouseRepo.findOne({
          where: { warehouse_id: dto.warehouse_id },
        });
        if (!wh) {
          throw new BadRequestException('Warehouse not found for warehouse_id');
        }
        user.warehouse_id = dto.warehouse_id;
      }
    }

    if (dto.email !== undefined) user.email = dto.email;
    if (dto.name !== undefined) user.full_name = dto.name; // ✅
    if (dto.role !== undefined) user.role = dto.role;
    if (dto.is_active !== undefined) user.is_active = dto.is_active;

    return this.userRepo.save(user);
  }

  async remove(user_id: number): Promise<void> {
    const user = await this.findOne(user_id);
    await this.userRepo.remove(user);
  }
}
