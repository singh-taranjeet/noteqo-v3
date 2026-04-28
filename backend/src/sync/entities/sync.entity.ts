import {
  Entity,
  OneToOne,
  Index,
  Column,
  JoinTable,
  JoinColumn,
} from 'typeorm';
import { AppBaseEntity } from '../../shared/entities/base.entity';
import { SYNC_COLUMN, SYNC_TABLE } from '../constants/sync.constants';
import { UserEntity } from '../../users/entities/user.entity';

@Entity({ name: SYNC_TABLE.NAME })
export class SyncEntity extends AppBaseEntity {
  @OneToOne(() => UserEntity, { cascade: true })
  @Column({ name: SYNC_COLUMN.USER_ID, type: 'uuid' })
  @JoinColumn()
  @Index()
  userId: string;
}
