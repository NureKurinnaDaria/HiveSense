import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateAlertDto {
  @ApiPropertyOptional({ example: 'HUMIDITY_HIGH' })
  @IsOptional()
  @IsIn(['TEMP_HIGH', 'TEMP_LOW', 'HUMIDITY_HIGH', 'HUMIDITY_LOW'])
  type?: string;

  @ApiPropertyOptional({ example: 'NEW' })
  @IsOptional()
  @IsIn(['NEW', 'ACKNOWLEDGED', 'RESOLVED'])
  status?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  warehouse_id?: number;

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

  @ApiPropertyOptional({
    example: '2025-12-12T10:00:00.000Z',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  resolved_at?: Date | null;
}
