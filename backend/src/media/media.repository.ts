import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaEntity } from './entities/media.entity';
import { Media } from './types/media.types';
import { UploadMediaDto } from './dto/upload-media.dto';

@Injectable()
export class MediaRepository {
  constructor(
    @InjectRepository(MediaEntity)
    private readonly orm: Repository<MediaEntity>,
  ) {}

  async findById(id: string): Promise<Media | null> {
    const entity = await this.orm.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByNoteId(noteId: string): Promise<Media[]> {
    const entities = await this.orm.find({ where: { noteId } });
    return entities.map((e) => this.toDomain(e));
  }

  async create(dto: UploadMediaDto, url: string): Promise<Media> {
    const entity = this.orm.create({
      id: dto.id,
      noteId: dto.noteId,
      spaceId: dto.spaceId,
      mimeType: dto.mimeType,
      sizeBytes: dto.sizeBytes,
      url,
    });
    const saved = await this.orm.save(entity);
    return this.toDomain(saved);
  }

  async deleteById(id: string): Promise<void> {
    await this.orm.softDelete(id);
  }

  async deleteByNoteId(noteId: string): Promise<void> {
    const entities = await this.orm.find({ where: { noteId } });
    if (entities.length > 0) {
      await this.orm.softDelete(entities.map((e) => e.id));
    }
  }

  private toDomain(entity: MediaEntity): Media {
    return {
      id: entity.id,
      noteId: entity.noteId,
      spaceId: entity.spaceId,
      mimeType: entity.mimeType,
      sizeBytes: entity.sizeBytes,
      url: entity.url,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
