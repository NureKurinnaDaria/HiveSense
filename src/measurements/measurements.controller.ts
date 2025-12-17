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
import { MeasurementsService } from './measurements.service';
import { CreateMeasurementDto } from './dto/create-measurement.dto';
import { UpdateMeasurementDto } from './dto/update-measurement.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Measurements')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('measurements')
export class MeasurementsController {
  constructor(private readonly measurementsService: MeasurementsService) {}

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
  @ApiOperation({ summary: 'Отримати список вимірювань' })
  findAll() {
    return this.measurementsService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'OWNER', 'EMPLOYEE')
  @ApiOperation({ summary: 'Отримати вимірювання за measurement_id' })
  @ApiParam({ name: 'id', description: 'measurement_id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.measurementsService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Створити вимірювання (імітація телеметрії)' })
  create(@Body() dto: CreateMeasurementDto, @Req() req: any) {
    const { actor_user_id, actor_role } = this.getActor(req);
    return this.measurementsService.create(dto, actor_user_id, actor_role);
  }

  @Put(':id')
  @Roles('ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Оновити вимірювання' })
  @ApiParam({ name: 'id', description: 'measurement_id' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateMeasurementDto,
    @Req() req: any,
  ) {
    const { actor_user_id, actor_role } = this.getActor(req);
    return this.measurementsService.update(id, dto, actor_user_id, actor_role);
  }

  @Delete(':id')
  @Roles('ADMIN', 'EMPLOYEE')
  @ApiOperation({ summary: 'Видалити вимірювання' })
  @ApiParam({ name: 'id', description: 'measurement_id' })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const { actor_user_id, actor_role } = this.getActor(req);
    return this.measurementsService.remove(id, actor_user_id, actor_role);
  }
}
