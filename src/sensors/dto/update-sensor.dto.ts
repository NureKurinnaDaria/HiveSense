import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSensorDto {
  @ApiPropertyOptional({ example: 'SN-002-ABC' })
  serial_number?: string;

  @ApiPropertyOptional({ example: 'TEMPERATURE' })
  type?: string;

  @ApiPropertyOptional({ example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ example: 1 })
  warehouse_id?: number;
}
