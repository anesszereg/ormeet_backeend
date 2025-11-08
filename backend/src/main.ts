import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Ormeet - Event Organization Platform API')
    .setDescription(
      `# Ormeet API Documentation
      
## Overview
Comprehensive event management platform with advanced features:
- 🎫 Event & Ticket Management
- 🏢 Multi-Organization Support with Team Roles
- 📱 Phone & Email Authentication
- 🔐 Passwordless Login with Verification Codes
- 👥 User Preferences (Attendee/Organizer)
- 📍 Venue Management with Geolocation
- 💳 Order Processing & Payments
- ⭐ Reviews & Ratings
- 🎁 Promotions & Discounts
- 📊 Attendance Tracking

## Authentication Methods
1. **Email + Password** - Traditional login
2. **Phone + Password** - Login with phone number
3. **Verification Code** - Passwordless login (email or phone)

## User Types
- **ATTENDEE** - Can browse events, purchase tickets, leave reviews
- **ORGANIZER** - Can create organizations, manage events, invite team members
- **ADMIN** - Full platform access

## Organization Roles
- **OWNER** - Full control, can manage all aspects
- **ADMIN** - Can add/remove members, manage events
- **EDITOR** - Can create and edit events
- **VIEWER** - Read-only access

## Getting Started
1. Register with email or phone
2. Verify your account (optional but recommended)
3. Login with password or verification code
4. Start creating or attending events!
      `,
    )
    .setVersion('2.0')
    .setContact(
      'Ormeet Support',
      'https://github.com/yourusername/ormeet',
      'Anesszereg1@gmail.com',
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addTag('Authentication', '🔐 User authentication, registration, verification codes, and passwordless login')
    .addTag('Events', '🎉 Event creation, management, publishing, and discovery')
    .addTag('Organizations', '🏢 Organization management with team roles (Owner, Admin, Editor, Viewer)')
    .addTag('Venues', '📍 Venue management with geolocation and capacity tracking')
    .addTag('Ticket Types', '🎟️ Ticket variations, pricing tiers, and availability')
    .addTag('Tickets', '🎫 Individual ticket management, QR codes, and transfers')
    .addTag('Orders', '💳 Order processing, payment tracking, and refunds')
    .addTag('Attendance', '📋 Event check-in/out with QR, NFC, and manual methods')
    .addTag('Reviews', '⭐ Event reviews, ratings, and moderation')
    .addTag('Promotions', '🎁 Discount codes, promotional campaigns, and validation')
    .addServer('http://localhost:3000', 'Local Development Server')
    .addServer('https://api.ormeet.com', 'Production Server (if deployed)')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token received from login/register endpoints',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
