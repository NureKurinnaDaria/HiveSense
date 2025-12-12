import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Sensor } from '../../sensors/entities/sensor.entity';
import { HoneyBatch } from '../../honey-batches/entities/honey-batch.entity';
import { Alert } from '../../alerts/entities/alert.entity';

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn()
  warehouse_id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  location: string;

  @Column({ length: 50 })
  status: string; // ACTIVE, INACTIVE

  // На одному складі працює багато користувачів
  @OneToMany(() => User, (user) => user.warehouse)
  users: User[];

  // Датчики складу
  @OneToMany(() => Sensor, (sensor) => sensor.warehouse)
  sensors: Sensor[];

  // Партії меду на складі
  @OneToMany(() => HoneyBatch, (batch) => batch.warehouse)
  honey_batches: HoneyBatch[];

  // Тривоги складу
  @OneToMany(() => Alert, (alert) => alert.warehouse)
  alerts: Alert[];
}
