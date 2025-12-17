import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Warehouses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  // бачити можуть всі ролі (ADMIN теж)
  @Get()
  @Roles('OWNER', 'ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Отримати список складів' })
  findAll() {
    return this.warehousesService.findAll();
  }

  // бачити конкретний склад також можуть всі ролі
  @Get(':id')
  @Roles('OWNER', 'ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Отримати склад за warehouse_id' })
  @ApiParam({ name: 'id', description: 'warehouse_id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.warehousesService.findOne(id);
  }

  // створення тільки OWNER
  @Post()
  @Roles('OWNER')
  @ApiOperation({ summary: 'Створити склад' })
  create(@Body() dto: CreateWarehouseDto) {
    return this.warehousesService.create(dto);
  }

  // редагування тільки OWNER
  @Put(':id')
  @Roles('OWNER')
  @ApiOperation({ summary: 'Оновити склад' })
  @ApiParam({ name: 'id', description: 'warehouse_id' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWarehouseDto,
  ) {
    return this.warehousesService.update(id, dto);
  }

  // видалення тільки OWNER
  @Delete(':id')
  @Roles('OWNER')
  @ApiOperation({ summary: 'Видалити склад' })
  @ApiParam({ name: 'id', description: 'warehouse_id' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.warehousesService.remove(id);
  }
}
