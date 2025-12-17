process.env.TZ = 'Europe/Kyiv';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation (DTO validation реально працює)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // прибирає зайві поля, яких нема в DTO
      transform: true, // приводить типи (наприклад "123" -> 123)
      forbidNonWhitelisted: true, // якщо прийшло зайве поле — 400
    }),
  );

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('HiveSense API')
    .setDescription('API для системи моніторингу зберігання меду')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
