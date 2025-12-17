import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user';
import { UpdateUserDto } from './dto/update-user';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'OWNER')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private getActor(req: any) {
    const raw =
      req?.user?.id ??
      req?.user?.userId ??
      req?.user?.user_id ??
      req?.user?.sub;

    const actor_user_id = Number(raw);
    const actor_role = req?.user?.role;

    if (!actor_user_id || !actor_role) {
      throw new UnauthorizedException('Invalid JWT payload: missing id/role');
    }

    return { actor_user_id, actor_role };
  }

  @Get()
  @ApiOperation({ summary: 'Отримати список користувачів' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Отримати користувача за user_id' })
  @ApiParam({ name: 'id', description: 'user_id' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Створити користувача' })
  create(@Body() dto: CreateUserDto, @Req() req: any) {
    const { actor_user_id, actor_role } = this.getActor(req);
    return this.usersService.createByActor(dto, actor_user_id, actor_role);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Оновити користувача' })
  @ApiParam({ name: 'id', description: 'user_id' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
    @Req() req: any,
  ) {
    const { actor_user_id, actor_role } = this.getActor(req);
    return this.usersService.updateByActor(id, dto, actor_user_id, actor_role);
  }

  @Patch(':id/block')
  @ApiOperation({ summary: 'Заблокувати користувача' })
  block(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const { actor_user_id, actor_role } = this.getActor(req);
    return this.usersService.setActiveByActor({
      target_user_id: id,
      active: false,
      actor_user_id,
      actor_role,
    });
  }

  @Patch(':id/unblock')
  @ApiOperation({ summary: 'Розблокувати користувача' })
  unblock(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const { actor_user_id, actor_role } = this.getActor(req);
    return this.usersService.setActiveByActor({
      target_user_id: id,
      active: true,
      actor_user_id,
      actor_role,
    });
  }

  @Delete(':id')
  @ApiOperation({
    summary:
      'Видалити користувача (OWNER може видалити ADMIN; ADMIN не може видалити OWNER)',
  })
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const { actor_user_id, actor_role } = this.getActor(req);
    return this.usersService.removeByActor({
      target_user_id: id,
      actor_user_id,
      actor_role,
    });
  }
}
