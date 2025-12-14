import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';

export class CreateMeasurementDto {
  @ApiPropertyOptional({
    example: '2025-12-12T10:15:00.000Z',
    description: 'Якщо не передано — сервер поставить поточний час',
    nullable: true,
  })
  @IsOptional()
  @IsDateString()
  measured_at?: string;

  @ApiProperty({ example: 27.35 })
  @IsNumber()
  temperature_c: number;

  @ApiProperty({ example: 58.2 })
  @IsNumber()
  @Min(0)
  humidity_percent: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  sensor_id: number;
}
