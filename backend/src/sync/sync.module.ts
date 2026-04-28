import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncEntity } from './entities/sync.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SyncEntity])],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}
