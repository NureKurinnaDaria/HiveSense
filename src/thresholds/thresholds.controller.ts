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
import { ThresholdsService } from './thresholds.service';
import { CreateThresholdDto } from './dto/create-threshold.dto';
import { UpdateThresholdDto } from './dto/update-threshold.dto';

@Controller('admin/thresholds')
export class ThresholdsController {
  constructor(private readonly thresholdsService: ThresholdsService) {}

  @Get()
  findAll() {
    return this.thresholdsService.findAll();
  }

  @Get('warehouse/:warehouse_id')
  findByWarehouse(@Param('warehouse_id', ParseIntPipe) warehouse_id: number) {
    return this.thresholdsService.findByWarehouse(warehouse_id);
  }

  @Post()
  create(@Body() dto: CreateThresholdDto) {
    return this.thresholdsService.create(dto);
  }

  @Put('warehouse/:warehouse_id')
  updateByWarehouse(
    @Param('warehouse_id', ParseIntPipe) warehouse_id: number,
    @Body() dto: UpdateThresholdDto,
  ) {
    return this.thresholdsService.updateByWarehouse(warehouse_id, dto);
  }

  @Delete('warehouse/:warehouse_id')
  removeByWarehouse(@Param('warehouse_id', ParseIntPipe) warehouse_id: number) {
    return this.thresholdsService.removeByWarehouse(warehouse_id);
  }
}
