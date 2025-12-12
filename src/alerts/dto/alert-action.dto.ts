import { ApiProperty } from '@nestjs/swagger';

export class AlertActionDto {
  @ApiProperty({ example: 5, description: 'Employee user_id' })
  user_id: number;
}
