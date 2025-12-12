import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateWarehouseDto {
  @ApiProperty({ example: 'Main Warehouse' })
  name: string;

  @ApiProperty({ example: 'Kharkiv, Ukraine' })
  location: string;

  @ApiPropertyOptional({ example: 'ACTIVE' })
  status?: string;

  @ApiProperty({ example: 1, description: 'Owner user_id' })
  user_id: number;
}
