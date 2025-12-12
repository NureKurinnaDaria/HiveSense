import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { Alert } from '../../alerts/entities/alert.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ length: 255 })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 255 })
  full_name: string;

  @Column({ length: 50 })
  role: string; // ADMIN, OWNER, EMPLOYEE

  @Column({ default: true })
  is_active: boolean;

  // Користувач працює на складі
  @Column({ nullable: true })
  warehouse_id: number | null;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.users, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  // Користувач може опрацьовувати багато тривог
  @OneToMany(() => Alert, (alert) => alert.user)
  alerts: Alert[];
}
