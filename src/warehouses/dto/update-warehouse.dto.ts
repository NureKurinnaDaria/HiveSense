import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateWarehouseDto {
  @ApiPropertyOptional({ example: 'Main Warehouse 2' })
  name?: string;

  @ApiPropertyOptional({ example: 'Kyiv, Ukraine' })
  location?: string;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  status?: string;

  @ApiPropertyOptional({ example: 1, description: 'Owner user_id' })
  user_id?: number;
}
