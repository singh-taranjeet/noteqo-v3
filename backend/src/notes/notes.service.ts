import { Injectable, Logger } from '@nestjs/common';
import { NotesRepository } from './notes.repository';
import { Note, NoteVersion } from './types/notes.types';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteNotFoundException } from '../shared/exceptions/note.exception';

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);

  constructor(private readonly notesRepository: NotesRepository) {}

  async create(dto: CreateNoteDto): Promise<Note> {
    this.logger.log(`Creating note in space ${dto.spaceId}`);

    return this.notesRepository.create(
      dto.id,
      Buffer.from(dto.ciphertext, 'utf8'),
      dto.spaceId,
      dto.type,
      dto.createdAt,
      dto.updatedAt,
      dto.parentId,
    );
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

    this.logger.log(`Saving new version for note ID ${id}`);

    return this.notesRepository.saveNewVersion(
      id,
      Buffer.from(dto.ciphertext, 'utf8'),
      note.version,
      dto.updatedAt,
      dto.isFavorite,
      dto.parentId,
    );
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
  }

  async permanentDelete(id: string): Promise<void> {
    const note = await this.notesRepository.findById(id);
    if (!note) {
      throw new NoteNotFoundException();
    }

    this.logger.log(`Permanently deleting note ${id} (DB CASCADE will handle descendants)`);
    await this.notesRepository.hardDelete(id);
  }
}
