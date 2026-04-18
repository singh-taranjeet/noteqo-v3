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

    this.logger.log(`Soft-deleting note ${id}`);
    await this.notesRepository.delete(id);
  }
}
