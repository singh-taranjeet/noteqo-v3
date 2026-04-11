import { CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { BASE_COLUMN } from '../constants/database.constants';

export abstract class AppBaseEntity {
  @CreateDateColumn({ name: BASE_COLUMN.CREATED_AT })
  createdAt: Date;

  @UpdateDateColumn({ name: BASE_COLUMN.UPDATED_AT })
  updatedAt: Date;

  @DeleteDateColumn({ name: BASE_COLUMN.DELETED_AT, nullable: true })
  deletedAt: Date;
}
