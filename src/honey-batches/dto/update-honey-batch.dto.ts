import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateHoneyBatchDto {
  @ApiPropertyOptional({ example: 'Buckwheat' })
  variety?: string;

  @ApiPropertyOptional({ example: 80.0 })
  quantity_kg?: number;

  @ApiPropertyOptional({ example: '2025-12-12' })
  received_date?: string;

  @ApiPropertyOptional({ example: '2026-06-01', nullable: true })
  expiration_date?: string | null;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  status?: string;

  @ApiPropertyOptional({ example: 1 })
  warehouse_id?: number;
}
