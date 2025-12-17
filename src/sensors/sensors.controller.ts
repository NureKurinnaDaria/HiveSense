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
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { SensorsService } from './sensors.service';
import { CreateSensorDto } from './dto/create-sensor.dto';
import { UpdateSensorDto } from './dto/update-sensor.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';

@Controller('sensors')
export class SensorsController {
  constructor(private readonly sensorsService: SensorsService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER', 'EMPLOYEE')
  @Get()
  @ApiOperation({ summary: 'Отримати список датчиків' })
  findAll() {
    return this.sensorsService.findAll();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'OWNER', 'EMPLOYEE')
  @Get(':id')
  @ApiOperation({ summary: 'Отримати датчик за sensor_id' })
  @ApiParam({ name: 'id', description: 'sensor_id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sensorsService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  @ApiOperation({ summary: 'Створити датчик' })
  create(@Body() dto: CreateSensorDto) {
    return this.sensorsService.create(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':id')
  @ApiOperation({ summary: 'Оновити датчик' })
  @ApiParam({ name: 'id', description: 'sensor_id' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSensorDto) {
    return this.sensorsService.update(id, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  @ApiOperation({ summary: 'Видалити датчик' })
  @ApiParam({ name: 'id', description: 'sensor_id' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sensorsService.remove(id);
  }
}
