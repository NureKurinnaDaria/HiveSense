import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  // коли сталася подія
  @CreateDateColumn()
  created_at: Date;

  // хто зробив дію
  @Column()
  actor_user_id: number;

  @Column({ length: 20 })
  actor_role: string; // ADMIN / OWNER / EMPLOYEE

  // що зробили
  @Column({ length: 30 })
  action: string;
  // CREATE / UPDATE / DELETE / BLOCK / UNBLOCK

  // над чим
  @Column({ length: 30 })
  entity: string;
  // USERS / THRESHOLDS / MEASUREMENTS / ALERTS / WAREHOUSES

  // id сутності (може бути null)
  @Column({ type: 'int', nullable: true })
  entity_id: number | null;

  // додаткові деталі (необовʼязково)
  @Column({ type: 'text', nullable: true })
  details: string | null;
}
