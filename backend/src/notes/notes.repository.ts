import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { NoteEntity } from './entities/note.entity';
import { KeySlotEntity } from './entities/key-slot.entity';
import { NoteVersionEntity } from './entities/note-version.entity';
import { Note } from './types/notes.types';
import { getCurrentUserId } from '../shared/utils/cls.utils';

@Injectable()
export class NotesRepository {
  constructor(
    @InjectRepository(NoteEntity)
    private readonly noteOrm: Repository<NoteEntity>,
    @InjectRepository(NoteVersionEntity)
    private readonly versionOrm: Repository<NoteVersionEntity>,
    private readonly dataSource: DataSource,
  ) { }

  /**
   * Retrieves a Note accurately from the master table, natively querying
   * and merging all associated contextual KeySlots securely providing
   * authorization capabilities locally.
   */
  async findById(id: string): Promise<Note | null> {
    const entity = await this.noteOrm.findOne({
      where: { id },
      relations: ['keySlots'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  /**
   * Executes a robust database transaction bridging creation natively across three distinct tables:
   * 1. Constructs the master Note object locally ensuring ID alignment universally.
   * 2. Binds the explicit starting permission structurally locally via KeySlot tables mapping document keys.
   * 3. Triggers the baseline version history Snapshot organically natively defining Version 1 safely.
   */
  async createWithKeySlot(
    id: string,
    ciphertext: Buffer,
    encryptedDocKey: Buffer,
  ): Promise<Note> {
    const note = this.noteOrm.create({
      id,
      ciphertext,
      version: 1,
    });

    // We start a transaction to ensure both Note, KeySlot, and initial Version are saved atomically.
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Save note
      const savedNote = await queryRunner.manager.save(NoteEntity, note);

      // 2. Save owner's key slot
      const currentUserId = getCurrentUserId();

      const keySlot = queryRunner.manager.create(KeySlotEntity, {
        noteId: savedNote.id,
        userId: currentUserId,
        encryptedDocKey,
      });
      await queryRunner.manager.save(KeySlotEntity, keySlot);

      // 3. Save initial version history
      const noteVersion = queryRunner.manager.create(NoteVersionEntity, {
        noteId: savedNote.id,
        ciphertext,
        version: 1,
      });
      await queryRunner.manager.save(NoteVersionEntity, noteVersion);

      await queryRunner.commitTransaction();

      const completeNote = await this.findById(savedNote.id);
      return completeNote as Note;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Employs Option B (Last-Write-Wins + Version History) offline synchronization cleanly natively:
   * Wraps an unconditional update across the master NoteEntity inherently advancing its iteration logically,
   * while sequentially spawning a permanent append-only `NoteVersionEntity` log capturing historical differences perfectly!
   */
  async saveNewVersion(
    id: string,
    newCiphertext: Buffer,
    currentVersion: number,
  ): Promise<Note> {
    const nextVersion = currentVersion + 1;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const currentUserId = getCurrentUserId();

      // 1. Update the parent note unconditionally (Option B - last write wins)
      await queryRunner.manager.update(NoteEntity, id, {
        ciphertext: newCiphertext,
        version: nextVersion,
        updatedBy: currentUserId, // TypeORM .update() mathematically bypasses @BeforeUpdate hooks, so we map it out here!
      });

      // 2. Record the historical snapshot
      const snapshot = queryRunner.manager.create(NoteVersionEntity, {
        noteId: id,
        ciphertext: newCiphertext,
        version: nextVersion,
      });
      await queryRunner.manager.save(NoteVersionEntity, snapshot);

      await queryRunner.commitTransaction();

      return (await this.findById(id)) as Note;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Operates an implicit soft-deletion natively gracefully activating the `@DeleteDateColumn` mapping TypeOrm interceptors,
   * safely hiding the explicit note statically structurally without physically annihilating immutable logging dependencies.
   */
  async delete(id: string): Promise<void> {
    await this.noteOrm.softDelete(id);
  }

  /**
   * Mathematically isolates database abstractions implicitly bridging TypeOrm constraints securely
   * ensuring pure Domain mapping definitions structurally cascade functionally ensuring robust clean code implementations.
   */
  private toDomain(entity: NoteEntity): Note {
    return {
      id: entity.id,
      ciphertext: entity.ciphertext.toString('base64'),
      version: entity.version,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
      deletedBy: entity.deletedBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      keySlots: entity.keySlots?.map(ks => ({
        noteId: ks.noteId,
        userId: ks.userId,
        encryptedDocKey: ks.encryptedDocKey.toString('base64'),
      })),
    };
  }
}
