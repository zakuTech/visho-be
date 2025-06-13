import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

dotenv.config();

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('Auth API')
    .setDescription('API untuk Visho Sosmed')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('test', app, document);
  await app.listen(3000);
}

bootstrap();
