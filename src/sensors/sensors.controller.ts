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
import { SensorsService } from './sensors.service';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';

@ApiTags('Sensors')
@Controller('sensors')
export class SensorsController {
  constructor(private readonly sensorsService: SensorsService) {}

  @Get()
  @ApiOperation({ summary: 'Отримати список датчиків' })
  findAll() {
    return this.sensorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Отримати датчик за sensor_id' })
  @ApiParam({ name: 'id', description: 'sensor_id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sensorsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Створити датчик' })
  create(@Body() dto: CreateSensorDto) {
    return this.sensorsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Оновити датчик' })
  @ApiParam({ name: 'id', description: 'sensor_id' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSensorDto) {
    return this.sensorsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Видалити датчик' })
  @ApiParam({ name: 'id', description: 'sensor_id' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sensorsService.remove(id);
  }
}
