import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { MeasurementsService } from './measurements.service';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { UpdateMeasurementDto } from './dto/update-measurement.dto';

@ApiTags('Measurements')
@Controller('measurements')
export class MeasurementsController {
  constructor(private readonly measurementsService: MeasurementsService) {}

  @Get()
  @ApiOperation({ summary: 'Отримати список вимірювань' })
  findAll() {
    return this.measurementsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Отримати вимірювання за measurement_id' })
  @ApiParam({ name: 'id', description: 'measurement_id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.measurementsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Створити вимірювання (імітація телеметрії)' })
  create(@Body() dto: CreateMeasurementDto) {
    return this.measurementsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Оновити вимірювання' })
  @ApiParam({ name: 'id', description: 'measurement_id' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMeasurementDto,
  ) {
    return this.measurementsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Видалити вимірювання' })
  @ApiParam({ name: 'id', description: 'measurement_id' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.measurementsService.remove(id);
  }
}
