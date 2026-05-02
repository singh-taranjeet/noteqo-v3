import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { NoteEntity } from './entities/note.entity';
import { NoteVersionEntity } from './entities/note-version.entity';
import { Note, NoteVersion, NoteType } from './types/notes.types';
import { getCurrentUserId } from '../shared/utils/cls.utils';

@Injectable()
export class NotesRepository {
  constructor(
    @InjectRepository(NoteEntity)
    private readonly noteOrm: Repository<NoteEntity>,
    @InjectRepository(NoteVersionEntity)
    private readonly versionOrm: Repository<NoteVersionEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Retrieves a Note by ID.
   */
  async findById(id: string): Promise<Note | null> {
    const entity = await this.noteOrm.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  /**
   * Retrieves all Notes belonging to a specific space.
   */
  async findAllForSpace(spaceId: string): Promise<Note[]> {
    const entities = await this.noteOrm.find({
      where: { spaceId },
      order: { updatedAt: 'DESC' },
    });

    return entities.map((e) => this.toDomain(e));
  }

  /**
   * Creates a note with an initial version snapshot atomically.
   */
  async create(
    id: string,
    ciphertext: Buffer,
    spaceId: string,
    type: NoteType,
    createdAt: Date,
    updatedAt: Date,
  ): Promise<Note> {
    const note = this.noteOrm.create({
      id,
      ciphertext,
      version: 1,
      spaceId,
      type,
      createdAt,
      updatedAt,
    });

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Save note
      const savedNote = await queryRunner.manager.save(NoteEntity, note);

      // 2. Save initial version history
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
   * Last-Write-Wins + Version History: updates ciphertext, bumps version,
   * and appends a version snapshot for history.
   */
  async saveNewVersion(
    id: string,
    newCiphertext: Buffer,
    currentVersion: number,
    updatedAt: Date,
    isFavorite?: boolean,
  ): Promise<Note> {
    const nextVersion = currentVersion + 1;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const currentUserId = getCurrentUserId();

      // 1. Update the note (last-write-wins)
      await queryRunner.manager.update(NoteEntity, id, {
        ciphertext: newCiphertext,
        version: nextVersion,
        updatedBy: currentUserId,
        updatedAt,
        ...(isFavorite !== undefined ? { isFavorite } : {}),
      });

      // 2. Record version snapshot
      const snapshot = queryRunner.manager.create(NoteVersionEntity, {
        noteId: id,
        ciphertext: newCiphertext,
        version: nextVersion,
        updatedAt,
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
   * Soft-deletes a note.
   */
  async delete(id: string): Promise<void> {
    await this.noteOrm.softDelete(id);
  }

  /**
   * Retrieves all version snapshots for a given note, ordered newest-first.
   */
  async findVersions(noteId: string): Promise<NoteVersion[]> {
    const entities = await this.versionOrm.find({
      where: { noteId },
      order: { version: 'DESC' },
    });

    return entities.map((e) => this.toVersionDomain(e));
  }

  /**
   * Maps entity to domain type. Entity shape never leaks outside the repository.
   */
  private toDomain(entity: NoteEntity): Note {
    return {
      id: entity.id,
      ciphertext: entity.ciphertext.toString('utf8'),
      version: entity.version,
      spaceId: entity.spaceId,
      type: entity.type as NoteType,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
      deletedBy: entity.deletedBy,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      isFavorite: entity.isFavorite,
    };
  }

  /**
   * Maps a version entity to a lightweight domain shape.
   */
  private toVersionDomain(entity: NoteVersionEntity): NoteVersion {
    return {
      id: entity.id,
      noteId: entity.noteId,
      version: entity.version,
      ciphertext: entity.ciphertext.toString('utf8'),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
    };
  }
}
