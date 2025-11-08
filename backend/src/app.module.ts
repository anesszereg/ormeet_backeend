import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './events/events.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { VenuesModule } from './venues/venues.module';
import { ReviewsModule } from './reviews/reviews.module';
import { TicketTypesModule } from './ticket-types/ticket-types.module';
import { OrdersModule } from './orders/orders.module';
import { TicketsModule } from './tickets/tickets.module';
import { PromotionsModule } from './promotions/promotions.module';
import { AttendanceModule } from './attendance/attendance.module';
import {
  User,
  Organization,
  OrganizationInvitation,
  VerificationCode,
  Venue,
  Event,
  TicketType,
  Order,
  Ticket,
  Attendance,
  Review,
  Promotion,
  Media,
} from './entities';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        entities: [
          User,
          Organization,
          OrganizationInvitation,
          VerificationCode,
          Venue,
          Event,
          TicketType,
          Order,
          Ticket,
          Attendance,
          Review,
          Promotion,
          Media,
        ],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    EventsModule,
    OrganizationsModule,
    VenuesModule,
    ReviewsModule,
    TicketTypesModule,
    OrdersModule,
    TicketsModule,
    PromotionsModule,
    AttendanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
