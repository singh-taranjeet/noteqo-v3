import { Injectable, Logger } from '@nestjs/common';
import { NotesRepository } from './notes.repository';
import { Note } from './types/notes.types';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteNotFoundException } from '../shared/exceptions/note.exception';

@Injectable()
export class NotesService {
  private readonly logger = new Logger(NotesService.name);

  constructor(private readonly notesRepository: NotesRepository) {}

  async create(dto: CreateNoteDto): Promise<Note> {
    this.logger.log(`Creating note locally offline-first`);

    return this.notesRepository.createWithKeySlot(
      dto.id,
      Buffer.from(dto.ciphertext, 'base64'),
      Buffer.from(dto.encryptedDocKey, 'base64'),
    );
  }

  async findAll(userId: string): Promise<Note[]> {
    return this.notesRepository.findAllForUser(userId);
  }

  async findOne(id: string): Promise<Note> {
    const note = await this.notesRepository.findById(id);
    if (!note) {
      throw new NoteNotFoundException();
    }
    // Auth checking would occur here if we weren't just prototyping
    return note;
  }

  async update(id: string, dto: UpdateNoteDto): Promise<Note> {
    const note = await this.notesRepository.findById(id);
    if (!note) {
      throw new NoteNotFoundException();
    }

    this.logger.log(`Saving new version for note ID ${id}`);

    // According to Option B: Last-write-wins + Version history.
    // We increment the DB version and snapshot the version so previous inputs can be recovered.
    return this.notesRepository.saveNewVersion(
      id,
      Buffer.from(dto.ciphertext, 'base64'),
      note.version,
    );
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
