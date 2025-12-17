import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';

const AUDIT_ENTITIES = [
  'USERS',
  'WAREHOUSES',
  'THRESHOLDS',
  'MEASUREMENTS',
  'ALERTS',
] as const;

const AUDIT_ACTIONS = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'BLOCK',
  'UNBLOCK',
] as const;

export type AuditEntity = (typeof AUDIT_ENTITIES)[number];
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export class AuditQueryDto {
  @ApiPropertyOptional({
    enum: AUDIT_ENTITIES,
    description: 'Entity name',
  })
  @IsOptional()
  @IsEnum(AUDIT_ENTITIES)
  entity?: AuditEntity;

  @ApiPropertyOptional({
    enum: AUDIT_ACTIONS,
    description: 'Action name',
  })
  @IsOptional()
  @IsEnum(AUDIT_ACTIONS)
  action?: AuditAction;

  @ApiPropertyOptional({
    example: '2025-12-17',
    description: 'From date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  from?: string;

  @ApiPropertyOptional({
    example: '2025-12-17',
    description: 'To date (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  to?: string;
}
