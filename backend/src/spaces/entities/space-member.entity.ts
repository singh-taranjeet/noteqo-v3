import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AppBaseEntity } from '../../shared/entities/base.entity';
import {
  SPACE_MEMBER_TABLE,
  SPACE_MEMBER_COLUMN,
  SPACE_ROLE,
} from '../constants/spaces.constants';
import { SpaceEntity } from './space.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: SPACE_MEMBER_TABLE.NAME })
export class SpaceMemberEntity extends AppBaseEntity {
  @PrimaryColumn('uuid', { name: SPACE_MEMBER_COLUMN.SPACE_ID })
  spaceId: string;

  @PrimaryColumn('uuid', { name: SPACE_MEMBER_COLUMN.USER_ID })
  userId: string;

  @Column({
    name: SPACE_MEMBER_COLUMN.ROLE,
    type: 'varchar',
    default: SPACE_ROLE.EDITOR,
  })
  role: string;

  @ManyToOne(() => SpaceEntity, (space) => space.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: SPACE_MEMBER_COLUMN.SPACE_ID })
  space: SpaceEntity;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: SPACE_MEMBER_COLUMN.USER_ID })
  user: UserEntity;
}
