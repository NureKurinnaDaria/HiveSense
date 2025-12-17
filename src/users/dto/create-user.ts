import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Passw0rd!' })
  @IsString()
  @Length(6, 128)
  password: string;

  @ApiProperty({ example: 'worker', enum: ['worker', 'admin', 'owner'] })
  @IsIn(['worker', 'admin', 'owner'])
  role: 'worker' | 'admin' | 'owner';

  @ApiProperty({ example: true })
  @IsBoolean()
  is_active: boolean;

  @ApiPropertyOptional({
    example: 1,
    description: 'ID складу (для EMPLOYEE). Для OWNER може бути відсутнім.',
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  warehouse_id?: number;
}
