import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { PushNotificationsService } from './push-notifications.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [PushNotificationsService],
  exports: [PushNotificationsService],
})
export class NotificationsModule {}
