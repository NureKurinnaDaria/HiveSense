import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Sensor } from '../../sensors/entities/sensor.entity';

@Entity('measurements')
export class Measurement {
  @PrimaryGeneratedColumn()
  measurement_id: number;

  @Column({ type: 'timestamptz' })
  measured_at: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  temperature_c: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  humidity_percent: number;

  // ---------- FK: Sensor (обовʼязково) ----------
  @Column()
  sensor_id: number;

  @ManyToOne(() => Sensor, (sensor) => sensor.measurements, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sensor_id' })
  sensor: Sensor;
}
