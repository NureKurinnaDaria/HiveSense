import { ApiPropertyOptional } from '@nestjs/swagger';
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

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'John Smith' })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string;

  @ApiPropertyOptional({ example: 'john.smith@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  // залишаємо як у тебе (worker/admin/owner), але далі замапимо в сервісі
  @ApiPropertyOptional({
    example: 'worker',
    enum: ['worker', 'admin', 'owner'],
  })
  @IsOptional()
  @IsIn(['worker', 'admin', 'owner'])
  role?: 'worker' | 'admin' | 'owner';

  // опційно: щоб адмін міг скинути/змінити пароль
  @ApiPropertyOptional({ example: 'newStrongPassword123' })
  @IsOptional()
  @IsString()
  @Length(6, 255)
  password?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  // дозволяємо null, щоб "відвʼязати" користувача від складу
  @ApiPropertyOptional({
    example: 1,
    description: 'ID складу або null щоб прибрати привʼязку',
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  warehouse_id?: number | null;
}
