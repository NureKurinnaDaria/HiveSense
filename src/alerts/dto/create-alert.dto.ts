import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAlertDto {
  @ApiProperty({ example: 'TEMP_HIGH' })
  type: string;

  // За схемою warehouse_id обов'язковий
  @ApiProperty({ example: 1 })
  warehouse_id: number;

  @ApiPropertyOptional({ example: 1, nullable: true })
  sensor_id?: number | null;

  @ApiPropertyOptional({ example: 5, nullable: true })
  user_id?: number | null;
}
