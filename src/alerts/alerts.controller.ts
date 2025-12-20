import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';
import { UpdateAlertDto } from './dto/update-alert.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  private getActor(req: any) {
    // пріоритет userId (бо JwtStrategy гарантовано його повертає)
    const raw =
      req?.user?.userId ??
      req?.user?.id ??
      req?.user?.user_id ??
      req?.user?.sub;

    const actor_user_id = Number(raw);
    const actor_role = req?.user?.role;

    // якщо тут NaN — краще одразу зупинити, ніж писати null в БД
    if (!Number.isFinite(actor_user_id) || actor_user_id <= 0) {
      throw new BadRequestException('Invalid actor_user_id from JWT');
    }

    return { actor_user_id, actor_role };
  }

  // Перегляд — усі ролі
  @Get()
  @Roles('ADMIN', 'OWNER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Отримати список тривог' })
  findAll() {
    return this.alertsService.findAll();
  }

  // Перегляд — усі ролі
  @Get(':id')
  @Roles('ADMIN', 'OWNER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Отримати тривогу за alert_id' })
  @ApiParam({ name: 'id', description: 'alert_id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.alertsService.findOne(id);
  }

  // Створення — тільки працівник (імітація / ручне створення)
  @Post()
  @Roles('EMPLOYEE')
  @ApiOperation({ summary: 'Створити тривогу (тест/імітація)' })
  create(@Body() dto: CreateAlertDto, @Req() req: any) {
    const { actor_user_id, actor_role } = this.getActor(req);
    return this.alertsService.create(dto, actor_user_id, actor_role);
  }

  // Оновлення — тільки працівник
  @Put(':id')
  @Roles('EMPLOYEE')
  @ApiOperation({ summary: 'Оновити тривогу' })
  @ApiParam({ name: 'id', description: 'alert_id' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAlertDto,
    @Req() req: any,
  ) {
    const { actor_user_id, actor_role } = this.getActor(req);
    return this.alertsService.update(id, dto, actor_user_id, actor_role);
  }

  // Видалення — тільки працівник
  @Delete(':id')
  @Roles('EMPLOYEE')
  @ApiOperation({ summary: 'Видалити тривогу' })
  @ApiParam({ name: 'id', description: 'alert_id' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const { actor_user_id, actor_role } = this.getActor(req);
    return this.alertsService.remove(id, actor_user_id, actor_role);
  }

  // Підтвердити — тільки працівник
  @Put(':id/acknowledge')
  @Roles('EMPLOYEE')
  @ApiOperation({
    summary: 'Підтвердити тривогу (ACKNOWLEDGED) + записати user_id з JWT',
  })
  @ApiParam({ name: 'id', description: 'alert_id' })
  acknowledge(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const { actor_user_id, actor_role } = this.getActor(req);
    return this.alertsService.acknowledge(id, actor_user_id, actor_role);
  }

  // Закрити — тільки працівник
  @Put(':id/resolve')
  @Roles('EMPLOYEE')
  @ApiOperation({
    summary: 'Закрити тривогу (RESOLVED) + resolved_at + user_id з JWT',
  })
  @ApiParam({ name: 'id', description: 'alert_id' })
  resolve(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const { actor_user_id, actor_role } = this.getActor(req);
    return this.alertsService.resolve(id, actor_user_id, actor_role);
  }
}
