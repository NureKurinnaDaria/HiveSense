import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';
import { Measurement } from '../../measurements/entities/measurement.entity';
import { Alert } from '../../alerts/entities/alert.entity';

@Entity('sensors')
export class Sensor {
  @PrimaryGeneratedColumn()
  sensor_id: number;

  @Column({ length: 100, unique: true })
  serial_number: string;

  @Column({ length: 50 })
  type: string; // комбінований

  @Column({ default: true })
  is_active: boolean;

  // FK: Warehouse
  @Column()
  warehouse_id: number;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.sensors, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @OneToMany(() => Measurement, (m) => m.sensor)
  measurements: Measurement[];

  @OneToMany(() => Alert, (a) => a.sensor)
  alerts: Alert[];
}
