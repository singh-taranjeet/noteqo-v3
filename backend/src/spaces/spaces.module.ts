import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SpacesController } from './spaces.controller';
import { SpacesService } from './spaces.service';
import { SpacesRepository } from './spaces.repository';
import { SpaceEntity } from './entities/space.entity';
import { SpaceMemberEntity } from './entities/space-member.entity';
import { SpaceKeySlotEntity } from './entities/space-key-slot.entity';
import { NotesModule } from '../notes';
import { UsersModule } from '../users';
import { SyncModule } from '../sync/sync.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SpaceEntity,
      SpaceMemberEntity,
      SpaceKeySlotEntity,
    ]),
    NotesModule,
    UsersModule,
    SyncModule,
  ],
  controllers: [SpacesController],
  providers: [SpacesService, SpacesRepository],
  exports: [SpacesService],
})
export class SpacesModule {}
