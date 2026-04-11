import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { AppBaseEntity } from '../../shared/entities/base.entity';
import { USER_TABLE, USER_COLUMN } from '../constants/users.constants';

@Entity({ name: USER_TABLE.NAME })
export class UserEntity extends AppBaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: USER_COLUMN.ID })
  id: string;

  @Column({ name: USER_COLUMN.EMAIL, unique: true })
  email: string;

  @Column({ name: USER_COLUMN.PASSWORD })
  password: string;

  @Column({ name: USER_COLUMN.NAME })
  name: string;
}
