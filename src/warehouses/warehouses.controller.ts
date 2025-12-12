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
import { WarehousesService } from './warehouses.service';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@ApiTags('Warehouses')
@Controller('warehouses')
export class WarehousesController {
  constructor(private readonly warehousesService: WarehousesService) {}

  @Get()
  @ApiOperation({ summary: 'Отримати список складів' })
  findAll() {
    return this.warehousesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Отримати склад за warehouse_id' })
  @ApiParam({ name: 'id', description: 'warehouse_id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.warehousesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Створити склад' })
  create(@Body() dto: CreateWarehouseDto) {
    return this.warehousesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Оновити склад' })
  @ApiParam({ name: 'id', description: 'warehouse_id' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateWarehouseDto,
  ) {
    return this.warehousesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Видалити склад' })
  @ApiParam({ name: 'id', description: 'warehouse_id' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.warehousesService.remove(id);
  }
}
