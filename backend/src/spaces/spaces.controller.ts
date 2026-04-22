import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { SpacesService } from './spaces.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateNoteDto } from '../notes/dto/create-note.dto';
import { UpdateNoteDto } from '../notes/dto/update-note.dto';
import {
  SpaceResponseDto,
  SpaceMemberResponseDto,
  SpaceNotesResponseDto,
} from './dto/space-response.dto';
import { NoteResponseDto } from '../notes/dto/note-response.dto';
import { SPACE_ROUTES } from './constants/spaces.constants';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Space } from './types/spaces.types';
import { Note } from '../notes/types/notes.types';

@Controller(SPACE_ROUTES.BASE)
@UseGuards(JwtAuthGuard)
export class SpacesController {
  constructor(private readonly spacesService: SpacesService) {}

  // ─── Spaces CRUD ─────────────────────────────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreateSpaceDto,
  ): Promise<SpaceResponseDto> {
    const space = await this.spacesService.create(dto);
    return this.mapSpaceToResponse(space);
  }

  @Get()
  async findAll(@Req() req: { user: { id: string } }): Promise<SpaceResponseDto[]> {
    const spaces = await this.spacesService.findAll(req.user.id);
    return spaces.map((s) => this.mapSpaceToResponse(s));
  }

  @Get(SPACE_ROUTES.BY_ID)
  async findOne(
    @Param('spaceId', ParseUUIDPipe) spaceId: string,
    @Req() req: { user: { id: string } },
  ): Promise<SpaceResponseDto> {
    const space = await this.spacesService.findOne(spaceId, req.user.id);
    return this.mapSpaceToResponse(space);
  }

  @Patch(SPACE_ROUTES.BY_ID)
  async update(
    @Param('spaceId', ParseUUIDPipe) spaceId: string,
    @Body() dto: UpdateSpaceDto,
    @Req() req: { user: { id: string } },
  ): Promise<SpaceResponseDto> {
    const space = await this.spacesService.update(spaceId, dto, req.user.id);
    return this.mapSpaceToResponse(space);
  }

  @Delete(SPACE_ROUTES.BY_ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('spaceId', ParseUUIDPipe) spaceId: string,
    @Req() req: { user: { id: string } },
  ): Promise<void> {
    await this.spacesService.remove(spaceId, req.user.id);
  }

  // ─── Members ─────────────────────────────────────────────────────────────────

  @Post(SPACE_ROUTES.MEMBERS)
  @HttpCode(HttpStatus.CREATED)
  async addMember(
    @Param('spaceId', ParseUUIDPipe) spaceId: string,
    @Body() dto: AddMemberDto,
    @Req() req: { user: { id: string } },
  ): Promise<void> {
    await this.spacesService.addMember(spaceId, dto, req.user.id);
  }

  @Get(SPACE_ROUTES.MEMBERS)
  async findMembers(
    @Param('spaceId', ParseUUIDPipe) spaceId: string,
    @Req() req: { user: { id: string } },
  ): Promise<SpaceMemberResponseDto[]> {
    const members = await this.spacesService.findMembers(
      spaceId,
      req.user.id,
    );
    return members.map((m) => ({
      userId: m.userId,
      role: m.role as SpaceMemberResponseDto['role'],
    }));
  }

  @Delete(SPACE_ROUTES.MEMBER_BY_ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Param('spaceId', ParseUUIDPipe) spaceId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req: { user: { id: string } },
  ): Promise<void> {
    await this.spacesService.removeMember(spaceId, userId, req.user.id);
  }

  // ─── Space Notes ─────────────────────────────────────────────────────────────

  @Post(SPACE_ROUTES.NOTES)
  @HttpCode(HttpStatus.CREATED)
  async createNote(
    @Param('spaceId', ParseUUIDPipe) spaceId: string,
    @Body() dto: CreateNoteDto,
    @Req() req: { user: { id: string } },
  ): Promise<NoteResponseDto> {
    const note = await this.spacesService.createNote(
      spaceId,
      dto,
      req.user.id,
    );
    return this.mapNoteToResponse(note);
  }

  @Get(SPACE_ROUTES.NOTES)
  async findNotes(
    @Param('spaceId', ParseUUIDPipe) spaceId: string,
    @Req() req: { user: { id: string } },
  ): Promise<SpaceNotesResponseDto> {
    const { notes, encryptedSpaceKey } = await this.spacesService.findNotes(
      spaceId,
      req.user.id,
    );
    return {
      spaceId,
      encryptedSpaceKey,
      notes: notes.map((n) => ({
        id: n.id,
        ciphertext: n.ciphertext,
        version: n.version,
        spaceId: n.spaceId,
        type: n.type,
        createdBy: n.createdBy,
        updatedBy: n.updatedBy,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
      })),
    };
  }

  @Patch(SPACE_ROUTES.NOTE_BY_ID)
  async updateNote(
    @Param('spaceId', ParseUUIDPipe) spaceId: string,
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @Body() dto: UpdateNoteDto,
    @Req() req: { user: { id: string } },
  ): Promise<NoteResponseDto> {
    const note = await this.spacesService.updateNote(
      spaceId,
      noteId,
      dto,
      req.user.id,
    );
    return this.mapNoteToResponse(note);
  }

  @Delete(SPACE_ROUTES.NOTE_BY_ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeNote(
    @Param('spaceId', ParseUUIDPipe) spaceId: string,
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @Req() req: { user: { id: string } },
  ): Promise<void> {
    await this.spacesService.removeNote(spaceId, noteId, req.user.id);
  }

  // ─── Mappers ─────────────────────────────────────────────────────────────────

  private mapSpaceToResponse(space: Space): SpaceResponseDto {
    return {
      id: space.id,
      encryptedName: space.encryptedName,
      type: space.type,
      isDefault: space.isDefault,
      createdBy: space.createdBy,
      updatedBy: space.updatedBy,
      deletedBy: space.deletedBy,
      createdAt: space.createdAt,
      updatedAt: space.updatedAt,
      members: space.members?.map((m) => ({
        userId: m.userId,
        role: m.role,
      })),
      keySlots: space.keySlots?.map((ks) => ({
        userId: ks.userId,
        encryptedSpaceKey: ks.encryptedSpaceKey,
      })),
    };
  }

  private mapNoteToResponse(note: Note): NoteResponseDto {
    return {
      id: note.id,
      ciphertext: note.ciphertext,
      version: note.version,
      spaceId: note.spaceId,
      type: note.type,
      createdBy: note.createdBy,
      updatedBy: note.updatedBy,
      deletedBy: note.deletedBy,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }
}
