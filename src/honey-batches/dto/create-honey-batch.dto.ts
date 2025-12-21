import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateHoneyBatchDto {
  @ApiProperty({ example: 'Acacia' })
  @IsString()
  @Length(2, 100)
  variety: string;

  @ApiProperty({ example: 125.5 })
  @IsNumber()
  @Min(0)
  quantity_kg: number;

  @ApiProperty({ example: '2025-12-12' })
  @IsDateString()
  received_date: string;

  @ApiPropertyOptional({ example: '2026-06-01', nullable: true })
  @IsOptional()
  @ValidateIf((o) => o.expiration_date !== null)
  @IsDateString()
  expiration_date?: string | null;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  warehouse_id: number;
}
