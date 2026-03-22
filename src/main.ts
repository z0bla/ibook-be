import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Swagger setup
  if (configService.get<string>('NODE_ENV') === 'development') {
    const config = new DocumentBuilder()
      .setTitle('iBook API')
      .setVersion('1.0')
      .build();
    SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, config));
  }

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Port iz .env ili default 3000
  const port = Number(configService.get<string>('APP_PORT')) || 3000;

  await app.listen(port);
  console.log(`🚀 Nest application running on port ${port}`);
}

bootstrap().catch((err) => {
  console.error('Nest application failed to start', err);
  process.exit(1);
});
