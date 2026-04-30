import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteResponseDto } from './dto/note-response.dto';
import { NoteVersionResponseDto } from './dto/note-version-response.dto';
import { NOTE_ROUTES } from './constants/notes.constants';
import { Note, NoteVersion } from './types/notes.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller(NOTE_ROUTES.BASE)
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateNoteDto): Promise<NoteResponseDto> {
    const note = await this.notesService.create(dto);
    return this.mapToResponse(note);
  }

  @Get(NOTE_ROUTES.BY_ID)
  async findOne(
    @Param('noteId', ParseUUIDPipe) id: string,
  ): Promise<NoteResponseDto> {
    const note = await this.notesService.findOne(id);
    return this.mapToResponse(note);
  }

  @Patch(NOTE_ROUTES.BY_ID)
  async update(
    @Param('noteId', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNoteDto,
  ): Promise<NoteResponseDto> {
    const note = await this.notesService.update(id, dto);
    return this.mapToResponse(note);
  }

  @Delete(NOTE_ROUTES.BY_ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('noteId', ParseUUIDPipe) id: string): Promise<void> {
    await this.notesService.remove(id);
  }

  @Get(NOTE_ROUTES.VERSIONS)
  async getVersions(
    @Param('noteId', ParseUUIDPipe) noteId: string,
  ): Promise<NoteVersionResponseDto[]> {
    const versions = await this.notesService.getVersions(noteId);
    return versions.map((v) => this.mapVersionToResponse(v));
  }

  private mapToResponse(note: Note): NoteResponseDto {
    return {
      id: note.id,
      ciphertext: note.ciphertext,
      version: note.version,
      spaceId: note.spaceId,
      type: note.type,
      isFavorite: note.isFavorite,
      createdBy: note.createdBy,
      updatedBy: note.updatedBy,
      deletedBy: note.deletedBy,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }

  private mapVersionToResponse(version: NoteVersion): NoteVersionResponseDto {
    return {
      id: version.id,
      noteId: version.noteId,
      version: version.version,
      ciphertext: version.ciphertext,
      createdAt: version.createdAt,
      updatedAt: version.updatedAt,
      createdBy: version.createdBy,
      updatedBy: version.updatedBy,
    };
  }
}
