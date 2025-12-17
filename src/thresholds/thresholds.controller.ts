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
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ThresholdsService } from './thresholds.service';
import { CreateThresholdDto } from './dto/create-threshold.dto';
import { UpdateThresholdDto } from './dto/update-threshold.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Thresholds')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('thresholds')
export class ThresholdsController {
  constructor(private readonly thresholdsService: ThresholdsService) {}

  private getActor(req: any) {
    const raw =
      req?.user?.id ??
      req?.user?.user_id ??
      req?.user?.sub ??
      req?.user?.userId;

    const actor_user_id = Number(raw);
    const actor_role = req?.user?.role;

    return { actor_user_id, actor_role };
  }

  // Перегляд — усі ролі
  @Get()
  @Roles('ADMIN', 'OWNER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Отримати список порогових значень' })
  findAll() {
    return this.thresholdsService.findAll();
  }

  // Перегляд порогів для конкретного складу
  @Get('warehouse/:warehouse_id')
  @Roles('ADMIN', 'OWNER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Отримати порогові значення для складу' })
  findByWarehouse(@Param('warehouse_id', ParseIntPipe) warehouse_id: number) {
    return this.thresholdsService.findByWarehouse(warehouse_id);
  }

  // Налаштування системних параметрів — тільки ADMIN
  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Створити порогові значення для складу' })
  create(@Body() dto: CreateThresholdDto, @Req() req: any) {
    const { actor_user_id, actor_role } = this.getActor(req);
    if (!actor_user_id) {
      throw new Error(
        'actor_user_id is missing in req.user (JWT validate payload)',
      );
    }

    return this.thresholdsService.create(dto, actor_user_id, actor_role);
  }

  // Зміна порогів — тільки ADMIN
  @Put('warehouse/:warehouse_id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Оновити порогові значення складу' })
  updateByWarehouse(
    @Param('warehouse_id', ParseIntPipe) warehouse_id: number,
    @Body() dto: UpdateThresholdDto,
    @Req() req: any,
  ) {
    const { actor_user_id, actor_role } = this.getActor(req);
    if (!actor_user_id) {
      throw new Error(
        'actor_user_id is missing in req.user (JWT validate payload)',
      );
    }

    return this.thresholdsService.updateByWarehouse(
      warehouse_id,
      dto,
      actor_user_id,
      actor_role,
    );
  }

  // Видалення порогів — тільки ADMIN
  @Delete('warehouse/:warehouse_id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Видалити порогові значення складу' })
  removeByWarehouse(
    @Param('warehouse_id', ParseIntPipe) warehouse_id: number,
    @Req() req: any,
  ) {
    const { actor_user_id, actor_role } = this.getActor(req);
    if (!actor_user_id) {
      throw new Error(
        'actor_user_id is missing in req.user (JWT validate payload)',
      );
    }

    return this.thresholdsService.removeByWarehouse(
      warehouse_id,
      actor_user_id,
      actor_role,
    );
  }
}
