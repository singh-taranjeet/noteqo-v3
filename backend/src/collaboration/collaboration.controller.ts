import {
  Controller,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { CollaborationService } from './collaboration.service';
import { COLLABORATION_ROUTES } from './constants/collaboration.constants';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SpaceRoleGuard } from '../auth/guards/space-role.guard';
import { RequireSpaceRole } from '../shared/decorators/space-role.decorator';
import { SPACE_ROLE } from '../spaces/constants/spaces.constants';

/** DTO for the compaction request */
class CompactNoteDto {
  encryptedState: string;
}

/**
 * REST controller for collaboration-related operations.
 * Currently only handles compaction of Yjs update logs.
 */
@Controller(COLLABORATION_ROUTES.BASE)
@UseGuards(JwtAuthGuard, SpaceRoleGuard)
export class CollaborationController {
  constructor(
    private readonly collaborationService: CollaborationService,
  ) {}

  /**
   * Compacts a note's Yjs update log into a single full-state snapshot.
   * The client is responsible for encoding the full Yjs state and encrypting it.
   * The server stores the opaque blob — it never decrypts.
   */
  @Post(COLLABORATION_ROUTES.COMPACT)
  @RequireSpaceRole({
    resourceType: 'note',
    roles: [SPACE_ROLE.OWNER, SPACE_ROLE.EDITOR],
  })
  @HttpCode(HttpStatus.OK)
  async compact(
    @Param('noteId', ParseUUIDPipe) noteId: string,
    @Body() dto: CompactNoteDto,
  ): Promise<{ sequenceNumber: number }> {
    const sequenceNumber = await this.collaborationService.compact(
      noteId,
      dto.encryptedState,
    );
    return { sequenceNumber };
  }
}
