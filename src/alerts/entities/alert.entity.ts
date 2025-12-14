import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { Sensor } from '../../sensors/entities/sensor.entity';
import { User } from '../../users/entities/user.entity';

@Entity('alerts')
export class Alert {
  @PrimaryGeneratedColumn()
  alert_id: number;

  @Column({ length: 50 })
  type: string; // TEMP_HIGH, TEMP_LOW, HUMIDITY_HIGH

  @Column({ length: 50, default: 'NEW' })
  status: string; // NEW | ACKNOWLEDGED | RESOLVED

  @Column({ type: 'timestamptz' })
  created_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  resolved_at: Date | null;

  @Column()
  warehouse_id: number;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.alerts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ nullable: true })
  sensor_id: number | null;

  @ManyToOne(() => Sensor, (sensor) => sensor.alerts, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'sensor_id' })
  sensor: Sensor | null;

  @Column({ nullable: true })
  user_id: number | null;

  @ManyToOne(() => User, (user) => user.alerts, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user: User | null;
}
