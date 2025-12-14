import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class UpdateMeasurementDto {
  @ApiPropertyOptional({ example: '2025-12-12T10:15:00.000Z' })
  @IsOptional()
  @IsDateString()
  measured_at?: string;

  @ApiPropertyOptional({ example: 25.0 })
  @IsOptional()
  @IsNumber()
  temperature_c?: number;

  @ApiPropertyOptional({ example: 60.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  humidity_percent?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  sensor_id?: number;
}
