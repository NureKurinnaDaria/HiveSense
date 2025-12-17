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
import { HoneyBatchesService } from './honey-batches.service';
import { CreateHoneyBatchDto } from './dto/create-honey-batch.dto';
import { UpdateHoneyBatchDto } from './dto/update-honey-batch.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Honey Batches')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('honey-batches')
export class HoneyBatchesController {
  constructor(private readonly honeyBatchesService: HoneyBatchesService) {}

  // Перегляд — усі ролі
  @Get()
  @Roles('ADMIN', 'OWNER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Отримати список партій меду' })
  findAll() {
    return this.honeyBatchesService.findAll();
  }

  // Перегляд — усі ролі
  @Get(':id')
  @Roles('ADMIN', 'OWNER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Отримати партію меду за batch_id' })
  @ApiParam({ name: 'id', description: 'batch_id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.honeyBatchesService.findOne(id);
  }

  // Редагування/створення — тільки працівник
  @Post()
  @Roles('EMPLOYEE')
  @ApiOperation({ summary: 'Створити нову партію меду' })
  create(@Body() dto: CreateHoneyBatchDto) {
    return this.honeyBatchesService.create(dto);
  }

  // Редагування — тільки працівник
  @Put(':id')
  @Roles('EMPLOYEE')
  @ApiOperation({ summary: 'Оновити партію меду' })
  @ApiParam({ name: 'id', description: 'batch_id' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHoneyBatchDto,
  ) {
    return this.honeyBatchesService.update(id, dto);
  }

  // Видалення — тільки працівник
  @Delete(':id')
  @Roles('EMPLOYEE')
  @ApiOperation({ summary: 'Видалити партію меду' })
  @ApiParam({ name: 'id', description: 'batch_id' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.honeyBatchesService.remove(id);
  }
}
