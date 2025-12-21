import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class UpdateSensorDto {
  @ApiPropertyOptional({ example: 'SN-002-ABC' })
  @IsOptional()
  @IsString()
  @Length(3, 100)
  serial_number?: string;

  @ApiPropertyOptional({ example: 'COMBINED' })
  @IsOptional()
  @IsIn(['COMBINED'])
  type?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  warehouse_id?: number;
}
