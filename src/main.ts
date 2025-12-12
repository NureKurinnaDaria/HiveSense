import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔹 Swagger config
  const config = new DocumentBuilder()
    .setTitle('HiveSense API')
    .setDescription('API для системи моніторингу зберігання меду')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: true, // дозволяє Swagger і браузер
    credentials: true,
  });

  await app.listen(3000);
}
bootstrap();
