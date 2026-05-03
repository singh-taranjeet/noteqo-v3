import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { MediaEntity } from './entities/media.entity';
import { SpaceMemberEntity } from '../spaces/entities/space-member.entity';
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

  async findBySpaceId(spaceId: string): Promise<Media[]> {
    const entities = await this.orm.find({
      where: { spaceId },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findBySpaceIds(spaceIds: string[]): Promise<Media[]> {
    if (!spaceIds || spaceIds.length === 0) return [];
    const entities = await this.orm.find({
      where: { spaceId: In(spaceIds) },
      order: { createdAt: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findByUserId(userId: string): Promise<Media[]> {
    const entities = await this.orm
      .createQueryBuilder('media')
      .innerJoin(SpaceMemberEntity, 'sm', 'media.spaceId = sm.spaceId')
      .where('sm.userId = :userId', { userId })
      .orderBy('media.createdAt', 'DESC')
      .getMany();
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
      meta: null,
    });
    const saved = await this.orm.save(entity);
    return this.toDomain(saved);
  }

  async update(id: string, meta?: string): Promise<Media> {
    await this.checkRecord(id);

    const updateData: Partial<MediaEntity> = {};
    if (meta !== undefined) updateData.meta = meta;
    await this.orm.update(id, updateData);
    const entity = await this.orm.findOne({ where: { id } });
    return this.toDomain(entity);
  }

  async deleteById(id: string): Promise<void> {
    await this.checkRecord(id);
    await this.orm.softDelete(id);
  }

  private async checkRecord(id: string) {
    const entity = await this.orm.findOne({ where: { id } });
    if (!entity) throw new Error(`Record with id ${id} not found`);
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
      meta: entity.meta,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
