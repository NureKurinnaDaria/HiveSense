import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from './users/users.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { HoneyBatchesModule } from './honey-batches/honey-batches.module';
import { SensorsModule } from './sensors/sensors.module';
import { MeasurementsModule } from './measurements/measurements.module';
import { AlertsModule } from './alerts/alerts.module';
import { ThresholdsModule } from './thresholds/thresholds.module';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { ReportsModule } from './reports/reports.module';
import { MqttModule } from './mqtt/mqtt.module';

@Module({
  imports: [
    // .env / Render env vars
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Postgres через DATABASE_URL (Render)
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,

      // Завжди SSL (для Render)
      ssl: { rejectUnauthorized: false },
      extra: { ssl: { rejectUnauthorized: false } },

      autoLoadEntities: true,
      synchronize: true,
    }),

    UsersModule,
    WarehousesModule,
    HoneyBatchesModule,
    SensorsModule,
    MeasurementsModule,
    AlertsModule,
    ThresholdsModule,
    AuthModule,
    AuditModule,
    ReportsModule,
    MqttModule,
  ],
})
export class AppModule {}
