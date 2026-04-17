import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SaveFcmTokenDto {
  @ApiProperty({
    example: 'fcm_example_token',
    description: 'FCM token мобільного пристрою',
  })
  @IsString()
  @IsNotEmpty()
  fcmToken: string;
}
