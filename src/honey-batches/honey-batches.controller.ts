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
import { HoneyBatchesService } from './honey-batches.service';
import { CreateHoneyBatchDto } from './dto/create-honey-batch.dto';
import { UpdateHoneyBatchDto } from './dto/update-honey-batch.dto';

@ApiTags('Honey Batches')
@Controller('honey-batches')
export class HoneyBatchesController {
  constructor(private readonly honeyBatchesService: HoneyBatchesService) {}

  @Get()
  @ApiOperation({ summary: 'Отримати список партій меду' })
  findAll() {
    return this.honeyBatchesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Отримати партію меду за batch_id' })
  @ApiParam({ name: 'id', description: 'batch_id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.honeyBatchesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Створити нову партію меду' })
  create(@Body() dto: CreateHoneyBatchDto) {
    return this.honeyBatchesService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Оновити партію меду' })
  @ApiParam({ name: 'id', description: 'batch_id' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHoneyBatchDto,
  ) {
    return this.honeyBatchesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Видалити партію меду' })
  @ApiParam({ name: 'id', description: 'batch_id' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.honeyBatchesService.remove(id);
  }
}
