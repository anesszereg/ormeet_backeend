import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPreferencesController } from './user-preferences.controller';
import { UserPreferencesService } from './user-preferences.service';
import { UserFavoriteEvent, UserFollowingOrganizer, Event, Organization } from '../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserFavoriteEvent,
      UserFollowingOrganizer,
      Event,
      Organization,
    ]),
  ],
  controllers: [UserPreferencesController],
  providers: [UserPreferencesService],
  exports: [UserPreferencesService],
})
export class UserPreferencesModule {}
