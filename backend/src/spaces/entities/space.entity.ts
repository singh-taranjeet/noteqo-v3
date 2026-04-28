import { Entity, Column, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../shared/entities/base.entity';
import { SPACE_TABLE, SPACE_COLUMN, SPACE_TYPE } from '../constants/spaces.constants';
import { SpaceMemberEntity } from './space-member.entity';
import { SpaceKeySlotEntity } from './space-key-slot.entity';
import { NoteEntity } from '../../notes/entities/note.entity';
import { Note } from '../../notes';

@Entity({ name: SPACE_TABLE.NAME })
export class SpaceEntity extends AppBaseEntity {
  @Column({ name: SPACE_COLUMN.ENCRYPTED_NAME, type: 'bytea' })
  encryptedName: Buffer;

  @Column({
    name: SPACE_COLUMN.TYPE,
    type: 'varchar',
    default: SPACE_TYPE.PERSONAL,
  })
  type: string;

  @Column({
    name: SPACE_COLUMN.IS_DEFAULT,
    type: 'boolean',
    default: false,
  })
  isDefault: boolean;

  @OneToMany(() => SpaceMemberEntity, (member) => member.space, {
    cascade: true,
  })
  members: SpaceMemberEntity[];

  @OneToMany(() => SpaceKeySlotEntity, (slot) => slot.space, { cascade: true })
  keySlots: SpaceKeySlotEntity[];

  // Add the OneToMany relation pointing back to the notes
  @OneToMany(() => NoteEntity, (note) => note.space, { cascade: true })
  notes: NoteEntity[];
}