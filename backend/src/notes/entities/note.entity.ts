import { Entity, Column, ManyToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../shared/entities/base.entity';
import { USER_TABLE } from '../../users/constants/users.constants';
import { NOTE_TABLE, NOTE_COLUMN } from '../constants/notes.constants';
import { KeySlotEntity } from './key-slot.entity';
import { NoteVersionEntity } from './note-version.entity';

@Entity({ name: NOTE_TABLE.NAME })
export class NoteEntity extends AppBaseEntity {
  @Column({ name: NOTE_COLUMN.CIPHERTEXT, type: 'bytea' })
  ciphertext: Buffer;

  @Column({ name: NOTE_COLUMN.VERSION, type: 'int', default: 1 })
  version: number;

  @OneToMany(() => KeySlotEntity, (keySlot) => keySlot.note, { cascade: true })
  keySlots: KeySlotEntity[];

  @OneToMany(() => NoteVersionEntity, (version) => version.note, { cascade: true })
  versions: NoteVersionEntity[];
}
