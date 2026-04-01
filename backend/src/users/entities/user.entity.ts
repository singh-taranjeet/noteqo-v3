import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { AppBaseEntity } from '../../shared/entities/base.entity';
import { USER_TABLE, USER_COLUMN } from '../constants/users.constants';

@Entity({ name: USER_TABLE.NAME })
export class UserEntity extends AppBaseEntity {
  @Column({ name: USER_COLUMN.EMAIL, unique: true })
  email: string;

  @Column({ name: USER_COLUMN.AUTH_CREDENTIAL, select: false })
  authCredential: string;

  @Column({ name: USER_COLUMN.NAME })
  name: string;

  @Column({ name: USER_COLUMN.PUBLIC_KEY, nullable: true })
  publicKey: string;

  @Column({ name: USER_COLUMN.PRIVATE_KEY, nullable: true })
  privateKey: string;
}
