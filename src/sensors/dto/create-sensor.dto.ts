import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateSensorDto {
  @ApiProperty({ example: 'SN-001-XYZ' })
  @IsString()
  @Length(3, 100)
  serial_number: string;

  @ApiProperty({ example: 'COMBINED' })
  @IsIn(['COMBINED'])
  type: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  warehouse_id: number;
}
