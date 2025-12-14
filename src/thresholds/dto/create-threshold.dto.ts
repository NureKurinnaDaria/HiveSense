import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class CreateThresholdDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  warehouse_id: number;

  @ApiProperty({ example: 10, description: 'Мінімальна температура (°C)' })
  @IsNumber()
  @Min(-50)
  @Max(100)
  temp_min: number;

  @ApiProperty({ example: 25, description: 'Максимальна температура (°C)' })
  @IsNumber()
  @Min(-50)
  @Max(100)
  temp_max: number;

  @ApiProperty({ example: 40, description: 'Мінімальна вологість (%)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  humidity_min: number;

  @ApiProperty({ example: 70, description: 'Максимальна вологість (%)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  humidity_max: number;
}
