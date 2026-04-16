import { Entity, Column, Index } from 'typeorm';
import { AppBaseEntity } from '../../shared/entities/base.entity';
import { MEDIA_TABLE } from '../constants/media.constants';

@Entity({ name: MEDIA_TABLE.NAME })
export class MediaEntity extends AppBaseEntity {
  @Column({ name: MEDIA_TABLE.COLUMN.NOTE_ID, type: 'uuid' })
  @Index()
  noteId: string;

  @Column({ name: MEDIA_TABLE.COLUMN.SPACE_ID, type: 'uuid' })
  @Index()
  spaceId: string;

  @Column({ name: MEDIA_TABLE.COLUMN.MIME_TYPE, type: 'varchar' })
  mimeType: string;

  @Column({ name: MEDIA_TABLE.COLUMN.SIZE_BYTES, type: 'int' })
  sizeBytes: number;

  @Column({ name: MEDIA_TABLE.COLUMN.URL, type: 'varchar' })
  url: string;
}
