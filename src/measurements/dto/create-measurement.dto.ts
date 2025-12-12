import { ApiProperty } from '@nestjs/swagger';

export class CreateMeasurementDto {
  @ApiProperty({ example: '2025-12-12T10:15:00.000Z' })
  measured_at: string;

  @ApiProperty({ example: 27.35 })
  temperature_c: number;

  @ApiProperty({ example: 58.2 })
  humidity_percent: number;

  @ApiProperty({ example: 1 })
  sensor_id: number;
}
