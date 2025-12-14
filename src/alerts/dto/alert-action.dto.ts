import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class AlertActionDto {
  @ApiProperty({ example: 5, description: 'Employee user_id' })
  @IsInt()
  @Min(1)
  user_id: number;
}
