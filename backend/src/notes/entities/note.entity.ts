import {
  Entity,
  Column,
  Index,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AppBaseEntity } from '../../shared/entities/base.entity';
import {
  NOTE_TABLE,
  NOTE_COLUMN,
  NOTE_TYPE,
} from '../constants/notes.constants';
import { NoteVersionEntity } from './note-version.entity';
import { SpaceEntity } from '../../spaces/entities/space.entity';
import { NoteType } from '../types/notes.types';

@Entity({ name: NOTE_TABLE.NAME })
export class NoteEntity extends AppBaseEntity {
  @Column({ name: NOTE_COLUMN.CIPHERTEXT, type: 'bytea' })
  ciphertext: Buffer;

  @Column({ name: NOTE_COLUMN.VERSION, type: 'int', default: 1 })
  version: number;

  // 1. Keep the spaceId column for direct ID access
  @Column({ name: NOTE_COLUMN.SPACE_ID, type: 'uuid' })
  @Index()
  spaceId: string;

  // 2. Define the actual relation using the Entity type
  @ManyToOne(() => SpaceEntity, (space) => space.notes)
  @JoinColumn({ name: NOTE_COLUMN.SPACE_ID }) // Link this relation to the spaceId column
  space: SpaceEntity;

  @Column({
    name: NOTE_COLUMN.TYPE,
    type: 'varchar',
    default: NOTE_TYPE.PRIVATE,
  })
  type: NoteType;

  @Column({
    name: NOTE_COLUMN.IS_FAVORITE,
    type: 'boolean',
    default: false,
  })
  isFavorite: boolean;

  @OneToMany(() => NoteVersionEntity, (version) => version.note, {
    cascade: true,
  })
  versions: NoteVersionEntity[];
}
