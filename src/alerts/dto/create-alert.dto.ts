import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class CreateAlertDto {
  @ApiProperty({ example: 'TEMP_HIGH' })
  @IsIn(['TEMP_HIGH', 'TEMP_LOW', 'HUMIDITY_HIGH', 'HUMIDITY_LOW'])
  type: string;

  // За схемою warehouse_id обов'язковий
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  warehouse_id: number;

  @ApiPropertyOptional({ example: 1, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  sensor_id?: number | null;

  @ApiPropertyOptional({ example: 5, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  user_id?: number | null;
}
