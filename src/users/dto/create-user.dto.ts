import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
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

  @ApiProperty({ example: 'worker' })
  @IsIn(['worker', 'admin', 'owner'])
  role: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  is_active: boolean;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  warehouse_id: number;
}
