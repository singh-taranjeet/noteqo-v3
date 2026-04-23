import { Entity, Column, Index, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../shared/entities/base.entity';
import {
  NOTE_TABLE,
  NOTE_COLUMN,
  NOTE_TYPE,
} from '../constants/notes.constants';
import { NoteVersionEntity } from './note-version.entity';

@Entity({ name: NOTE_TABLE.NAME })
export class NoteEntity extends AppBaseEntity {
  @Column({ name: NOTE_COLUMN.CIPHERTEXT, type: 'bytea' })
  ciphertext: Buffer;

  @Column({ name: NOTE_COLUMN.VERSION, type: 'int', default: 1 })
  version: number;

  @Column({ name: NOTE_COLUMN.SPACE_ID, type: 'uuid' })
  @Index()
  spaceId: string;

  @Column({
    name: NOTE_COLUMN.TYPE,
    type: 'varchar',
    default: NOTE_TYPE.PRIVATE,
  })
  type: string;

  @OneToMany(() => NoteVersionEntity, (version) => version.note, {
    cascade: true,
  })
  versions: NoteVersionEntity[];
}
