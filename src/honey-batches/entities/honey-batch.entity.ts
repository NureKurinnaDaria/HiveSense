import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Warehouse } from '../../warehouses/entities/warehouse.entity';

@Entity('honey_batches')
export class HoneyBatch {
  @PrimaryGeneratedColumn()
  batch_id: number;

  @Column({ length: 100 })
  variety: string; // сорт/вид меду

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  quantity_kg: number;

  @Column({ type: 'date' })
  received_date: string; // 'YYYY-MM-DD'

  @Column({ type: 'date', nullable: true })
  expiration_date: string | null;

  @Column({ length: 50, default: 'ACTIVE' })
  status: string; // ACTIVE | INACTIVE

  // FK: Warehouse (обовʼязково)
  @Column()
  warehouse_id: number;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.honey_batches, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;
}
