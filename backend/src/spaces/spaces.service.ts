import { Injectable, Logger } from '@nestjs/common';
import { SpacesRepository } from './spaces.repository';
import { NotesService } from '../notes/notes.service';
import { UsersService } from '../users/users.service';
import { CreateSpaceDto } from './dto/create-space.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { CreateNoteDto } from '../notes/dto/create-note.dto';
import { UpdateNoteDto } from '../notes/dto/update-note.dto';
import { Space } from './types/spaces.types';
import { Note } from '../notes/types/notes.types';
import { SPACE_TYPE, SPACE_ROLE } from './constants/spaces.constants';
import {
  SpaceNotFoundException,
  SpacePermissionException,
  SpaceCannotAddMemberException,
  SpaceCannotRemoveOwnerException,
  SpaceMemberExistsException,
  SpaceMemberNotFoundException,
} from '../shared/exceptions/space.exception';
import { UserNotFoundException } from '../shared/exceptions/user.exception';

@Injectable()
export class SpacesService {
  private readonly logger = new Logger(SpacesService.name);

  constructor(
    private readonly spacesRepository: SpacesRepository,
    private readonly notesService: NotesService,
    private readonly usersService: UsersService,
  ) {}

  // ─── Space CRUD ──────────────────────────────────────────────────────────────

  async create(dto: CreateSpaceDto): Promise<Space> {
    this.logger.log(`Creating ${dto.type} space`);

    return this.spacesRepository.createWithOwner(
      dto.id,
      Buffer.from(dto.encryptedName, 'utf8'),
      dto.type,
      Buffer.from(dto.ownerKeySlot, 'base64'),
    );
  }

  async findAll(userId: string): Promise<Space[]> {
    return this.spacesRepository.findAllForUser(userId);
  }

  async findOne(id: string, userId: string): Promise<Space> {
    const space = await this.spacesRepository.findById(id);
    if (!space) {
      throw new SpaceNotFoundException();
    }

    await this.verifyMembership(id, userId);
    return space;
  }

  async update(
    id: string,
    dto: UpdateSpaceDto,
    userId: string,
  ): Promise<Space> {
    const space = await this.spacesRepository.findById(id);
    if (!space) {
      throw new SpaceNotFoundException();
    }

    await this.verifyOwnership(id, userId);

    this.logger.log(`Updating space ${id}`);
    return this.spacesRepository.updateName(
      id,
      Buffer.from(dto.encryptedName, 'utf8'),
    );
  }

  async remove(id: string, userId: string): Promise<void> {
    const space = await this.spacesRepository.findById(id);
    if (!space) {
      throw new SpaceNotFoundException();
    }

    await this.verifyOwnership(id, userId);

    this.logger.log(`Soft-deleting space ${id}`);
    await this.spacesRepository.delete(id);
  }

  // ─── Members ─────────────────────────────────────────────────────────────────

  async addMember(
    spaceId: string,
    dto: AddMemberDto,
    requesterId: string,
  ): Promise<void> {
    const space = await this.spacesRepository.findById(spaceId);
    if (!space) {
      throw new SpaceNotFoundException();
    }

    // Only shared spaces can have members added
    if (space.type === SPACE_TYPE.PERSONAL) {
      throw new SpaceCannotAddMemberException();
    }

    await this.verifyOwnership(spaceId, requesterId);

    // Look up the invitee by email
    let invitee;
    try {
      invitee = await this.usersService.findByEmail(dto.email);
    } catch {
      throw new UserNotFoundException();
    }

    if (!invitee) {
      throw new UserNotFoundException();
    }

    // Check if already a member
    const existingMember = await this.spacesRepository.findMember(
      spaceId,
      invitee.id,
    );
    if (existingMember) {
      throw new SpaceMemberExistsException();
    }

    this.logger.log(`Adding member ${invitee.id} to space ${spaceId}`);

    await this.spacesRepository.addMember(
      spaceId,
      invitee.id,
      dto.role,
      Buffer.from(dto.encryptedSpaceKey, 'base64'),
    );
  }

  async findMembers(spaceId: string, userId: string) {
    await this.verifyMembership(spaceId, userId);
    return this.spacesRepository.findMembers(spaceId);
  }

  async removeMember(
    spaceId: string,
    targetUserId: string,
    requesterId: string,
  ): Promise<void> {
    const space = await this.spacesRepository.findById(spaceId);
    if (!space) {
      throw new SpaceNotFoundException();
    }

    if (space.type === SPACE_TYPE.PERSONAL) {
      throw new SpaceCannotAddMemberException();
    }

    await this.verifyOwnership(spaceId, requesterId);

    // Cannot remove the owner
    const targetMember = await this.spacesRepository.findMember(
      spaceId,
      targetUserId,
    );
    if (!targetMember) {
      throw new SpaceMemberNotFoundException();
    }

    if (targetMember.role === SPACE_ROLE.OWNER) {
      throw new SpaceCannotRemoveOwnerException();
    }

    this.logger.log(`Removing member ${targetUserId} from space ${spaceId}`);
    await this.spacesRepository.removeMember(spaceId, targetUserId);
  }

  // ─── Space Notes ─────────────────────────────────────────────────────────────

  async createNote(
    spaceId: string,
    dto: CreateNoteDto,
    userId: string,
  ): Promise<Note> {
    await this.verifyMembership(spaceId, userId);

    this.logger.log(`Creating note in space ${spaceId}`);
    return this.notesService.create({ ...dto, spaceId });
  }

  async findNotes(
    spaceId: string,
    userId: string,
  ): Promise<{ notes: Note[]; encryptedSpaceKey: string }> {
    await this.verifyMembership(spaceId, userId);

    const notes = await this.notesService.findAllForSpace(spaceId);

    // Fetch the requesting user's key slot for this space
    const keySlot = await this.spacesRepository.findKeySlot(spaceId, userId);
    const encryptedSpaceKey = keySlot
      ? keySlot.encryptedSpaceKey.toString('base64')
      : '';

    return { notes, encryptedSpaceKey };
  }

  async updateNote(
    spaceId: string,
    noteId: string,
    dto: UpdateNoteDto,
    userId: string,
  ): Promise<Note> {
    await this.verifyMembership(spaceId, userId);
    return this.notesService.update(noteId, dto);
  }

  async removeNote(
    spaceId: string,
    noteId: string,
    userId: string,
  ): Promise<void> {
    await this.verifyMembership(spaceId, userId);
    await this.notesService.remove(noteId);
  }

  // ─── Guards ──────────────────────────────────────────────────────────────────

  private async verifyMembership(
    spaceId: string,
    userId: string,
  ): Promise<void> {
    const member = await this.spacesRepository.findMember(spaceId, userId);
    if (!member) {
      throw new SpacePermissionException();
    }
  }

  private async verifyOwnership(
    spaceId: string,
    userId: string,
  ): Promise<void> {
    const member = await this.spacesRepository.findMember(spaceId, userId);
    if (!member || member.role !== SPACE_ROLE.OWNER) {
      throw new SpacePermissionException();
    }
  }
}
