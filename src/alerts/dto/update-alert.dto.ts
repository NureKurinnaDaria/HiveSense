import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAlertDto {
  @ApiPropertyOptional({ example: 'HUMIDITY_HIGH' })
  type?: string;

  @ApiPropertyOptional({ example: 'NEW' })
  status?: string;

  @ApiPropertyOptional({ example: 1 })
  warehouse_id?: number;

  @ApiPropertyOptional({ example: 1, nullable: true })
  sensor_id?: number | null;

  @ApiPropertyOptional({ example: 5, nullable: true })
  user_id?: number | null;

  @ApiPropertyOptional({ example: '2025-12-12T10:00:00.000Z', nullable: true })
  resolved_at?: Date | null;
}
