import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuditQueryDto } from './dto/audit-query.dto';

@ApiTags('Audit')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles('ADMIN', 'OWNER')
  @ApiOperation({ summary: 'Перегляд журналу подій (ADMIN/OWNER)' })
  findAll(@Query() query: AuditQueryDto) {
    // AuditService.findAll очікує string поля — тут вони і є
    return this.auditService.findAll({
      entity: query.entity,
      action: query.action,
      from: query.from,
      to: query.to,
    });
  }
}
