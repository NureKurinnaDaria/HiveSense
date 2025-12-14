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

@Module({
  imports: [
    // Читаємо .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // Підключення бази даних PostgreSQL через TypeORM
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,

      autoLoadEntities: true, // автоматично підключає всі Entities
      synchronize: true, // автоматично створює таблиці
    }),

    UsersModule,

    WarehousesModule,

    HoneyBatchesModule,

    SensorsModule,

    MeasurementsModule,

    AlertsModule,

    ThresholdsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
