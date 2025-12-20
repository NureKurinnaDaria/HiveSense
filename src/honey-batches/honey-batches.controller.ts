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

  private getActor(req: any) {
    const raw =
      req?.user?.id ??
      req?.user?.userId ??
      req?.user?.user_id ??
      req?.user?.sub;

    const actor_user_id = Number(raw);
    const actor_role = req?.user?.role;

    return { actor_user_id, actor_role };
  }

  @Get()
  @Roles('ADMIN', 'OWNER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Отримати список партій меду' })
  findAll(@Req() req: any) {
    const { actor_user_id, actor_role } = this.getActor(req);
    return this.honeyBatchesService.findAll(actor_user_id, actor_role);
  }

  @Get(':id')
  @Roles('ADMIN', 'OWNER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Отримати партію меду за batch_id' })
  @ApiParam({ name: 'id', description: 'batch_id' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const { actor_user_id, actor_role } = this.getActor(req);
    return this.honeyBatchesService.findOne(id, actor_user_id, actor_role);
  }

  @Post()
  @Roles('EMPLOYEE')
  @ApiOperation({ summary: 'Створити нову партію меду' })
  create(@Body() dto: CreateHoneyBatchDto, @Req() req: any) {
    const { actor_user_id, actor_role } = this.getActor(req);
    return this.honeyBatchesService.create(dto, actor_user_id, actor_role);
  }

  @Put(':id')
  @Roles('EMPLOYEE')
  @ApiOperation({ summary: 'Оновити партію меду' })
  @ApiParam({ name: 'id', description: 'batch_id' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateHoneyBatchDto,
    @Req() req: any,
  ) {
    const { actor_user_id, actor_role } = this.getActor(req);
    return this.honeyBatchesService.update(id, dto, actor_user_id, actor_role);
  }

  @Delete(':id')
  @Roles('EMPLOYEE')
  @ApiOperation({ summary: 'Видалити партію меду' })
  @ApiParam({ name: 'id', description: 'batch_id' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const { actor_user_id, actor_role } = this.getActor(req);
    return this.honeyBatchesService.remove(id, actor_user_id, actor_role);
  }
}
