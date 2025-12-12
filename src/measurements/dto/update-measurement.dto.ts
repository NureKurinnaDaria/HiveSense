import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMeasurementDto {
  @ApiPropertyOptional({ example: '2025-12-12T10:15:00.000Z' })
  measured_at?: string;

  @ApiPropertyOptional({ example: 25.0 })
  temperature_c?: number;

  @ApiPropertyOptional({ example: 60.0 })
  humidity_percent?: number;

  @ApiPropertyOptional({ example: 1 })
  sensor_id?: number;
}
