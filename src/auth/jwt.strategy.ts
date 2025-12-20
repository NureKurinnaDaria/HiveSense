import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'dev_secret',
    });
  }

  async validate(payload: { sub: number; role: string }) {
    const id = Number(payload?.sub);

    if (!Number.isFinite(id) || id <= 0) {
      throw new UnauthorizedException('Invalid token payload');
    }

    const user = await this.usersService.findOne(id);

    if (!user.is_active) {
      throw new UnauthorizedException('User is blocked');
    }

    return {
      userId: id,
      id,
      sub: id,
      role: user.role, // роль беремо з БД
    };
  }
}
