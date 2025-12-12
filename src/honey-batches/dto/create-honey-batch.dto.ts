import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHoneyBatchDto {
  @ApiProperty({ example: 'Acacia' })
  variety: string;

  @ApiProperty({ example: 125.5 })
  quantity_kg: number;

  @ApiProperty({ example: '2025-12-12' })
  received_date: string;

  @ApiPropertyOptional({ example: '2026-06-01', nullable: true })
  expiration_date?: string | null;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  status?: string;

  @ApiProperty({ example: 1 })
  warehouse_id: number;
}
