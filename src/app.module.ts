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

@Module({
  imports: [
    // Читаємо .env та Environment Variables
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Підключення бази даних PostgreSQL через DATABASE_URL (Render)
    TypeOrmModule.forRoot({
      type: 'postgres',

      // В Render задаєш DATABASE_URL (Internal Database URL),
      // Локально можеш також задати DATABASE_URL у .env
      url: process.env.DATABASE_URL,

      autoLoadEntities: true,
      synchronize: true,

      // Render/Postgres часто вимагає SSL у продакшні
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
      extra:
        process.env.NODE_ENV === 'production'
          ? { ssl: { rejectUnauthorized: false } }
          : {},
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
