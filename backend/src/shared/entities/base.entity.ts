import { Column, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate, DeleteDateColumn } from 'typeorm';
import { BASE_COLUMN } from '../constants/database.constants';
import { getCurrentUserId } from '../utils/cls.utils';

export abstract class AppBaseEntity {
  @PrimaryGeneratedColumn('uuid', { name: BASE_COLUMN.ID })
  id: string;

  @Column({ name: BASE_COLUMN.CREATED_AT, type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ name: BASE_COLUMN.UPDATED_AT, type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @DeleteDateColumn({ name: BASE_COLUMN.DELETED_AT, type: 'timestamptz', nullable: true })
  deletedAt: Date;

  @Column({ name: BASE_COLUMN.CREATED_BY, type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ name: BASE_COLUMN.UPDATED_BY, type: 'uuid', nullable: true })
  updatedBy: string;

  @Column({ name: BASE_COLUMN.DELETED_BY, type: 'uuid', nullable: true })
  deletedBy: string;

  @BeforeInsert()
  setCreationTimestamps() {
    // Safety check ensuring we exist within a web context natively 
    const userId = getCurrentUserId();

    if (!this.createdAt) {
      this.createdAt = new Date();
    }
    if (!this.updatedAt) {
      this.updatedAt = new Date();
    }
    if (!this.createdBy && userId) {
      this.createdBy = userId;
    }
    if (!this.updatedBy && userId) {
      this.updatedBy = userId;
    }
  }

  @BeforeUpdate()
  setUpdateTimestamps() {
    const userId = getCurrentUserId();

    if (!this.updatedAt) {
      this.updatedAt = new Date();
    }
    if (userId) {
      this.updatedBy = userId;
    }
  }
}
