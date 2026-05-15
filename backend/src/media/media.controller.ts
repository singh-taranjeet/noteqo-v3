import {
  Controller,
  Post,
  Get,
  Patch,
  Query,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaResponseDto } from './dto/media-response.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { UploadMediaDto } from './dto/upload-media.dto';
import { MEDIA_ROUTES } from './constants/media.constants';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../shared/decorators/current-user.decorator';
import { SpaceRoleGuard } from '../auth/guards/space-role.guard';
import { RequireSpaceRole } from '../shared/decorators/space-role.decorator';
import { SPACE_ROLE } from '../spaces/constants/spaces.constants';

@Controller(MEDIA_ROUTES.BASE)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * Handle Vercel Blob client upload requests and webhook callbacks.
   */
  @Post('upload')
  @HttpCode(HttpStatus.OK)
  async handleUpload(@Req() request: any, @Body() body: any): Promise<any> {
    const result = await this.mediaService.handleVercelBlobUpload(
      request,
      body,
    );
    return { success: true, ...result };
  }

  @Get()
  @UseGuards(JwtAuthGuard, SpaceRoleGuard)
  @RequireSpaceRole({ resourceType: 'media' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('spaceId') spaceId?: string,
  ): Promise<MediaResponseDto[]> {
    if (spaceId) {
      const media = await this.mediaService.findBySpaceId(spaceId);
      return media.map(this.mapToResponse);
    } else {
      const media = await this.mediaService.findByUserId(user.id);
      return media.map(this.mapToResponse);
    }
  }

  /**
   * Register a media record after a successful client-side upload.
   * This is a fallback for when the Vercel Blob onUploadCompleted
   * webhook cannot reach the server (e.g. local development).
   * If the record already exists, it is returned as-is.
   */
  @Post('register')
  @UseGuards(JwtAuthGuard, SpaceRoleGuard)
  @RequireSpaceRole({ resourceType: 'media', roles: [SPACE_ROLE.OWNER, SPACE_ROLE.EDITOR] })
  @HttpCode(HttpStatus.OK)
  async register(
    @Body() dto: UploadMediaDto & { url: string },
  ): Promise<MediaResponseDto> {
    const media = await this.mediaService.registerMedia(dto, dto.url);
    return this.mapToResponse(media);
  }

  @Patch(MEDIA_ROUTES.BY_ID)
  @UseGuards(JwtAuthGuard, SpaceRoleGuard)
  @RequireSpaceRole({ resourceType: 'media', roles: [SPACE_ROLE.OWNER, SPACE_ROLE.EDITOR] })
  async update(
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
    @Body() dto: UpdateMediaDto,
  ): Promise<MediaResponseDto> {
    const media = await this.mediaService.update(mediaId, dto);
    return this.mapToResponse(media);
  }

  /**
   * Delete a media blob (Vercel Blob + Postgres).
   */
  @Delete(MEDIA_ROUTES.BY_ID)
  @UseGuards(JwtAuthGuard, SpaceRoleGuard)
  @RequireSpaceRole({ resourceType: 'media', roles: [SPACE_ROLE.OWNER, SPACE_ROLE.EDITOR] })
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
  ): Promise<void> {
    await this.mediaService.delete(mediaId);
  }

  private mapToResponse(media: {
    id: string;
    noteId: string;
    spaceId: string;
    mimeType: string;
    sizeBytes: number;
    url: string;
    meta: string | null;
    createdAt: Date;
  }): MediaResponseDto {
    return {
      id: media.id,
      noteId: media.noteId,
      spaceId: media.spaceId,
      mimeType: media.mimeType,
      sizeBytes: media.sizeBytes,
      url: media.url,
      meta: media.meta,
      createdAt: media.createdAt,
    };
  }
}
