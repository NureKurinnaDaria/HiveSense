import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class UpdateHoneyBatchDto {
  @ApiPropertyOptional({ example: 'Buckwheat' })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  variety?: string;

  @ApiPropertyOptional({ example: 80.0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity_kg?: number;

  @ApiPropertyOptional({ example: '2025-12-12' })
  @IsOptional()
  @IsDateString()
  received_date?: string;

  @ApiPropertyOptional({ example: '2026-06-01', nullable: true })
  @IsOptional()
  @IsDateString()
  expiration_date?: string | null;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'EXPIRED', 'AT_RISK'])
  status?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  warehouse_id?: number;
}
