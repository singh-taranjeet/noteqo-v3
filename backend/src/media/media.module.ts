import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MediaEntity } from './entities/media.entity';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { VercelBlobStorageService } from './vercel-blob-storage.service';

import { MediaRepository } from './media.repository';

@Module({
  imports: [TypeOrmModule.forFeature([MediaEntity])],
  controllers: [MediaController],
  providers: [MediaService, MediaRepository, VercelBlobStorageService],
  exports: [MediaService],
})
export class MediaModule {}
