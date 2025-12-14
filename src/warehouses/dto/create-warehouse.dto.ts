import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, Length, IsOptional, IsIn } from 'class-validator';

export class CreateWarehouseDto {
  @ApiProperty({ example: 'Main Warehouse' })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty({ example: 'Kharkiv, Ukraine' })
  @IsString()
  @Length(2, 100)
  location: string;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: string;
}
