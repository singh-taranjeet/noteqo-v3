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
  Req,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteResponseDto } from './dto/note-response.dto';
import { NOTE_ROUTES } from './constants/notes.constants';
import { Note } from './types/notes.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller(NOTE_ROUTES.BASE)
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createNoteDto: CreateNoteDto): Promise<NoteResponseDto> {
    const note = await this.notesService.create(createNoteDto);
    return this.mapToResponse(note);
  }

  @Get()
  async findAll(@Req() req: any): Promise<NoteResponseDto[]> {
    const notes = await this.notesService.findAll(req.user.id);
    return notes.map((note) => this.mapToResponse(note));
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
    @Body() updateNoteDto: UpdateNoteDto,
  ): Promise<NoteResponseDto> {
    const note = await this.notesService.update(id, updateNoteDto);
    return this.mapToResponse(note);
  }

  @Delete(NOTE_ROUTES.BY_ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('noteId', ParseUUIDPipe) id: string): Promise<void> {
    await this.notesService.remove(id);
  }

  private mapToResponse(note: Note): NoteResponseDto {
    return {
      id: note.id,
      ciphertext: note.ciphertext,
      version: note.version,
      createdBy: note.createdBy,
      updatedBy: note.updatedBy,
      deletedBy: note.deletedBy,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      // Pass the fully structured key slots (base64 conversion already happened in the repository mapper)
      keySlots: note.keySlots?.map((ks) => ({
        userId: ks.userId,
        encryptedDocKey: ks.encryptedDocKey,
      })),
    };
  }
}
