import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: 'worker' })
  role: string;

  @ApiProperty({ example: true })
  is_active: boolean;

  @ApiProperty({ example: 1 })
  warehouse_id: number;
}
