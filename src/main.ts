import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Protocol 66 API')
    .setDescription('Medication Adherence Platform for Mental Health')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication & Magic Link')
    .addTag('medications', 'Medication Verification & Tracking')
    .addTag('mood', 'Mood Check-in & History')
    .addTag('clinician', 'Clinician Dashboard & Alerts')
    .addTag('users', 'User Management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 8000;
  await app.listen(port);

  console.log(`
🚀 Protocol 66 Backend is running!
📚 API Docs: http://localhost:${port}/docs
🏥 Health Check: http://localhost:${port}/health
  `);
}

bootstrap();
