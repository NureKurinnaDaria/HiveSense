import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Smith' })
  name?: string;

  @ApiPropertyOptional({ example: 'john.smith@example.com' })
  email?: string;

  @ApiPropertyOptional({ example: 'supervisor' })
  role?: string;

  @ApiPropertyOptional({ example: true })
  is_active?: boolean;

  @ApiPropertyOptional({ example: 1 })
  warehouse_id?: number;
}
