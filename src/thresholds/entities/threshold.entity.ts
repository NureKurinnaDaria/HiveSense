import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';

@Entity('thresholds')
@Unique(['warehouse_id'])
export class Threshold {
  @PrimaryGeneratedColumn()
  threshold_id: number;

  // FK → warehouses.warehouse_id (1 склад = 1 набір порогів)
  @Column()
  warehouse_id: number;

  @OneToOne(() => Warehouse, (w) => w.threshold, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ type: 'float' })
  temp_min: number;

  @Column({ type: 'float' })
  temp_max: number;

  @Column({ type: 'float' })
  humidity_min: number;

  @Column({ type: 'float' })
  humidity_max: number;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updated_at: Date;
}
