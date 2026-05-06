import { Injectable, Logger } from '@nestjs/common';
import { NotesRepository } from './notes.repository';
import { Note, NoteVersion } from './types/notes.types';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteNotFoundException } from '../shared/exceptions/note.exception';
import { NoteConflictException } from '../shared/exceptions/note.exception';
import { EventsService } from '../events/events.service';
import { getCurrentUserId } from '../shared/utils/cls.utils';

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);

  constructor(
    private readonly notesRepository: NotesRepository,
    private readonly eventsService: EventsService,
  ) {}

  async create(dto: CreateNoteDto): Promise<Note> {
    this.logger.log(`Creating note in space ${dto.spaceId}`);

    const note = await this.notesRepository.create(
      dto.id,
      Buffer.from(dto.ciphertext, 'utf8'),
      dto.spaceId,
      dto.type,
      dto.createdAt,
      dto.updatedAt,
      dto.parentId,
    );

    // Publish real-time event
    await this.eventsService.publish({
      entity: 'note',
      type: 'NOTE_CREATED',
      noteId: note.id,
      spaceId: note.spaceId,
      version: note.version,
      updatedBy: getCurrentUserId() || '',
      updatedAt: note.updatedAt,
    });

    return note;
  }

  async findAllForSpace(spaceId: string): Promise<Note[]> {
    return this.notesRepository.findAllForSpace(spaceId);
  }

  async findOne(id: string): Promise<Note> {
    const note = await this.notesRepository.findById(id);
    if (!note) {
      throw new NoteNotFoundException();
    }
    return note;
  }

  async update(id: string, dto: UpdateNoteDto): Promise<Note> {
    const note = await this.notesRepository.findById(id);
    if (!note) {
      throw new NoteNotFoundException();
    }

    // Version guard: reject stale updates
    if (note.version !== dto.baseVersion) {
      this.logger.warn(
        `Conflict on note ${id}: client baseVersion=${dto.baseVersion}, server version=${note.version}`,
      );
      throw new NoteConflictException(note);
    }

    this.logger.log(`Saving new version for note ID ${id}`);

    const updatedNote = await this.notesRepository.saveNewVersion(
      id,
      Buffer.from(dto.ciphertext, 'utf8'),
      note.version,
      dto.updatedAt,
      dto.isFavorite,
      dto.parentId,
    );

    // Publish real-time event
    await this.eventsService.publish({
      entity: 'note',
      type: 'NOTE_UPDATED',
      noteId: id,
      spaceId: updatedNote.spaceId,
      version: updatedNote.version,
      updatedBy: getCurrentUserId() || '',
      updatedAt: updatedNote.updatedAt,
    });

    return updatedNote;
  }

  async getVersions(noteId: string): Promise<NoteVersion[]> {
    const note = await this.notesRepository.findById(noteId);
    if (!note) {
      throw new NoteNotFoundException();
    }

    return this.notesRepository.findVersions(noteId);
  }

  async remove(id: string): Promise<void> {
    const note = await this.notesRepository.findById(id);
    if (!note) {
      throw new NoteNotFoundException();
    }

    this.logger.log(`Soft-deleting note ${id} and its descendants`);
    const descendantIds = await this.notesRepository.getDescendantIds(id);
    for (const descendantId of descendantIds) {
      await this.notesRepository.delete(descendantId);
    }

    // Publish real-time event
    await this.eventsService.publish({
      entity: 'note',
      type: 'NOTE_DELETED',
      noteId: id,
      spaceId: note.spaceId,
      version: note.version,
      updatedBy: getCurrentUserId() || '',
      updatedAt: new Date(),
    });
  }

  async restore(id: string): Promise<void> {
    const note = await this.notesRepository.findById(id);
    if (!note) {
      throw new NoteNotFoundException();
    }

    this.logger.log(`Restoring note ${id} and its descendants`);
    const descendantIds = await this.notesRepository.getDescendantIds(id);
    for (const descendantId of descendantIds) {
      await this.notesRepository.restore(descendantId);
    }

    // Publish real-time event
    await this.eventsService.publish({
      entity: 'note',
      type: 'NOTE_RESTORED',
      noteId: id,
      spaceId: note.spaceId,
      version: note.version,
      updatedBy: getCurrentUserId() || '',
      updatedAt: new Date(),
    });
  }

  async permanentDelete(id: string): Promise<void> {
    const note = await this.notesRepository.findById(id);
    if (!note) {
      throw new NoteNotFoundException();
    }

    this.logger.log(
      `Permanently deleting note ${id} (DB CASCADE will handle descendants)`,
    );
    await this.notesRepository.hardDelete(id);
  }
}
