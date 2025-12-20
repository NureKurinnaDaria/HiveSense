import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateAlertDto {
  @ApiPropertyOptional({ example: 'HUMIDITY_HIGH' })
  @IsOptional()
  @IsIn(['TEMP_HIGH', 'TEMP_LOW', 'HUMIDITY_HIGH', 'HUMIDITY_LOW'])
  type?: string;

  @ApiPropertyOptional({ example: 1, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  sensor_id?: number | null;
}
