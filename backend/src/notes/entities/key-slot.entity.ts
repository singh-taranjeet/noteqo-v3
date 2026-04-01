import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { KEY_SLOT_TABLE, KEY_SLOT_COLUMN } from '../constants/notes.constants';
import { AppBaseEntity } from '../../shared/entities/base.entity';
import { NoteEntity } from './note.entity';

@Entity({ name: KEY_SLOT_TABLE.NAME })
export class KeySlotEntity extends AppBaseEntity {
  @PrimaryColumn('uuid', { name: KEY_SLOT_COLUMN.NOTE_ID })
  noteId: string;

  @PrimaryColumn('uuid', { name: KEY_SLOT_COLUMN.USER_ID })
  userId: string;

  @Column({ name: KEY_SLOT_COLUMN.ENCRYPTED_DOC_KEY, type: 'bytea' })
  encryptedDocKey: Buffer;

  @ManyToOne(() => NoteEntity, (note) => note.keySlots, { onDelete: 'CASCADE' })
  @JoinColumn({ name: KEY_SLOT_COLUMN.NOTE_ID })
  note: NoteEntity;
}
