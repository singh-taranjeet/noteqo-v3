import { Entity, Column, OneToMany } from 'typeorm';
import { AppBaseEntity } from '../../shared/entities/base.entity';
import {
  SPACE_TABLE,
  SPACE_COLUMN,
  SPACE_TYPE,
} from '../constants/spaces.constants';
import { SpaceMemberEntity } from './space-member.entity';
import { SpaceKeySlotEntity } from './space-key-slot.entity';

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

  @OneToMany(() => SpaceMemberEntity, (member) => member.space, {
    cascade: true,
  })
  members: SpaceMemberEntity[];

  @OneToMany(() => SpaceKeySlotEntity, (slot) => slot.space, { cascade: true })
  keySlots: SpaceKeySlotEntity[];
}
