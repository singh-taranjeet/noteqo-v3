import { Entity, Column, Index, ManyToOne, JoinColumn } from 'typeorm';
import { AppBaseEntity } from '../../shared/entities/base.entity';
import {
  YJS_UPDATE_TABLE,
  YJS_UPDATE_COLUMN,
} from '../constants/collaboration.constants';
import { NoteEntity } from '../../notes/entities/note.entity';

/**
 * Stores encrypted Yjs CRDT updates per note.
 *
 * Each row is an opaque, AES-GCM encrypted binary blob that only
 * clients with the space key can decrypt. The server never sees plaintext.
 *
 * The sequence_number column enables ordering and catch-up after reconnect.
 */
@Entity({ name: YJS_UPDATE_TABLE.NAME })
export class YjsUpdateEntity extends AppBaseEntity {
  @Column({ name: YJS_UPDATE_COLUMN.NOTE_ID, type: 'uuid' })
  @Index()
  noteId: string;

  @ManyToOne(() => NoteEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: YJS_UPDATE_COLUMN.NOTE_ID })
  note: NoteEntity;

  /**
   * The encrypted Yjs update blob (AES-GCM format: iv:ciphertext as UTF-8).
   * Stored as bytea — completely opaque to the server.
   */
  @Column({ name: YJS_UPDATE_COLUMN.ENCRYPTED_UPDATE, type: 'bytea' })
  encryptedUpdate: Buffer;

  /**
   * Monotonically increasing sequence number per note.
   * Used for ordering updates and determining catch-up ranges.
   */
  @Column({
    name: YJS_UPDATE_COLUMN.SEQUENCE_NUMBER,
    type: 'bigint',
    default: 0,
  })
  sequenceNumber: number;

  /**
   * Whether this update is a compacted full-state snapshot.
   * When true, all updates with lower sequence numbers can be pruned.
   */
  @Column({
    name: YJS_UPDATE_COLUMN.IS_COMPACTED,
    type: 'boolean',
    default: false,
  })
  isCompacted: boolean;
}
