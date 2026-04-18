import { Injectable, Logger } from '@nestjs/common';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import * as fs from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PushNotificationsService {
  private readonly logger = new Logger(PushNotificationsService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {
    if (!getApps().length) {
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

      if (!serviceAccountPath) {
        this.logger.warn('FIREBASE_SERVICE_ACCOUNT_PATH is not set');
        return;
      }

      const serviceAccount = JSON.parse(
        fs.readFileSync(serviceAccountPath, 'utf8'),
      );

      initializeApp({
        credential: cert(serviceAccount),
      });

      this.logger.log('Firebase Admin initialized');
    }
  }

  async sendToToken(params: {
    token: string;
    title: string;
    body: string;
    data?: Record<string, string>;
  }) {
    try {
      const messageId = await getMessaging().send({
        token: params.token,
        android: {
          priority: 'high',
        },
        data: {
          title: params.title,
          body: params.body,
          ...(params.data ?? {}),
        },
      });

      this.logger.log(`Push sent successfully: ${messageId}`);
      return messageId;
    } catch (error: any) {
      this.logger.error(
        'Firebase send error',
        error?.stack || error?.message || String(error),
      );
      throw error;
    }
  }

  async sendToWarehouseUsers(params: {
    warehouse_id: number;
    title: string;
    body: string;
    data?: Record<string, string>;
  }) {
    const users = await this.userRepo.find({
      where: {
        warehouse_id: params.warehouse_id,
        is_active: true,
      },
    });

    const tokens = users
      .map((user) => user.fcm_token)
      .filter((token): token is string => Boolean(token));

    for (const token of tokens) {
      try {
        await this.sendToToken({
          token,
          title: params.title,
          body: params.body,
          data: params.data,
        });
      } catch (error: any) {
        this.logger.error(
          `Push failed for token: ${token}`,
          error?.stack || error?.message || String(error),
        );
      }
    }
  }
}
