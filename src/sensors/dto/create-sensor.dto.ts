import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSensorDto {
  @ApiProperty({ example: 'SN-001-XYZ' })
  serial_number: string;

  @ApiProperty({ example: 'COMBINED' })
  type: string;

  @ApiPropertyOptional({ example: true })
  is_active?: boolean;

  @ApiProperty({ example: 1 })
  warehouse_id: number;
}
