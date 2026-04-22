import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AppBaseEntity } from '../../shared/entities/base.entity';
import {
  SPACE_KEY_SLOT_TABLE,
  SPACE_KEY_SLOT_COLUMN,
} from '../constants/spaces.constants';
import { SpaceEntity } from './space.entity';

@Entity({ name: SPACE_KEY_SLOT_TABLE.NAME })
export class SpaceKeySlotEntity extends AppBaseEntity {
  @PrimaryColumn('uuid', { name: SPACE_KEY_SLOT_COLUMN.SPACE_ID })
  spaceId: string;

  @PrimaryColumn('uuid', { name: SPACE_KEY_SLOT_COLUMN.USER_ID })
  userId: string;

  @Column({ name: SPACE_KEY_SLOT_COLUMN.ENCRYPTED_SPACE_KEY, type: 'bytea' })
  encryptedSpaceKey: Buffer;

  @ManyToOne(() => SpaceEntity, (space) => space.keySlots, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: SPACE_KEY_SLOT_COLUMN.SPACE_ID })
  space: SpaceEntity;
}
