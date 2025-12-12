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
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { AlertActionDto } from './dto/alert-action.dto';

@ApiTags('Alerts')
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Отримати список тривог' })
  findAll() {
    return this.alertsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Отримати тривогу за alert_id' })
  @ApiParam({ name: 'id', description: 'alert_id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Створити тривогу (тест/імітація)' })
  create(@Body() dto: CreateAlertDto) {
    return this.alertsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Оновити тривогу' })
  @ApiParam({ name: 'id', description: 'alert_id' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateAlertDto) {
    return this.alertsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Видалити тривогу' })
  @ApiParam({ name: 'id', description: 'alert_id' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.remove(id);
  }

  @Put(':id/acknowledge')
  @ApiOperation({
    summary: 'Підтвердити тривогу (ACKNOWLEDGED) + записати user_id',
  })
  @ApiParam({ name: 'id', description: 'alert_id' })
  acknowledge(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AlertActionDto,
  ) {
    return this.alertsService.acknowledge(id, body.user_id);
  }

  @Put(':id/resolve')
  @ApiOperation({
    summary: 'Закрити тривогу (RESOLVED) + resolved_at + user_id',
  })
  @ApiParam({ name: 'id', description: 'alert_id' })
  resolve(@Param('id', ParseIntPipe) id: number, @Body() body: AlertActionDto) {
    return this.alertsService.resolve(id, body.user_id);
  }
}
