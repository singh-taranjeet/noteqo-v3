import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { SpaceMemberEntity } from '../spaces/entities/space-member.entity';
import { SpacesRepository } from '../spaces/spaces.repository';
import { SpaceEntity } from '../spaces/entities/space.entity';
import { SpaceKeySlotEntity } from '../spaces/entities/space-key-slot.entity';
import { CONFIG_KEYS } from '../config';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpaceMemberEntity,
      SpaceEntity,
      SpaceKeySlotEntity,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get(`${CONFIG_KEYS.JWT}.secret`),
      }),
    }),
  ],
  controllers: [EventsController],
  providers: [EventsService, SpacesRepository],
  exports: [EventsService],
})
export class EventsModule {}
