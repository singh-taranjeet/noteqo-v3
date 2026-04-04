import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import {
  NOTE_VERSION_TABLE,
  NOTE_VERSION_COLUMN,
} from '../constants/notes.constants';
import { AppBaseEntity } from '../../shared/entities/base.entity';
import { NoteEntity } from './note.entity';

@Entity({ name: NOTE_VERSION_TABLE.NAME })
export class NoteVersionEntity extends AppBaseEntity {
  @Column({ name: NOTE_VERSION_COLUMN.NOTE_ID, type: 'uuid' })
  noteId: string;

  @Column({ name: NOTE_VERSION_COLUMN.CIPHERTEXT, type: 'bytea' })
  ciphertext: Buffer;

  @Column({ name: NOTE_VERSION_COLUMN.VERSION, type: 'int' })
  version: number;

  @ManyToOne(() => NoteEntity, (note) => note.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: NOTE_VERSION_COLUMN.NOTE_ID })
  note: NoteEntity;
}
