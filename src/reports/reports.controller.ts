import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('warehouse/:id/summary')
  @Roles('OWNER')
  @ApiOperation({ summary: 'Звіт по складу (summary) — тільки OWNER' })
  @ApiParam({ name: 'id', description: 'warehouse_id' })
  getSummary(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.getWarehouseSummary(id);
  }
}
