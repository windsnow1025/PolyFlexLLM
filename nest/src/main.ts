import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppConfig } from './config/config.interface';

async function bootstrap() {
  // https://docs.nestjs.com/faq/raw-body
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  // https://docs.nestjs.com/security/cors
  app.enableCors();

  // https://docs.nestjs.com/techniques/validation
  app.useGlobalPipes(new ValidationPipe());

  // 	https://docs.nestjs.com/faq/raw-body
  app.useBodyParser('json', { limit: 'Infinity' });
  app.useBodyParser('urlencoded', { limit: 'Infinity', extended: true });

  // https://docs.nestjs.com/openapi/introduction
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Nest JS')
    .setDescription('Nest JS API description')
    .setVersion('1.0')
    .addTag('NestJS')
    .addBearerAuth()
    .addSecurityRequirements('bearer')
    .build();
  const documentFactory = () =>
    SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, documentFactory);

  const configService = app.get(ConfigService);
  const config = configService.get<AppConfig>('app')!;
  await app.listen(config.port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
