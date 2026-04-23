import {
  Controller,
  Post,
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
import { MEDIA_ROUTES } from './constants/media.constants';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller(MEDIA_ROUTES.BASE)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * Handle Vercel Blob client upload requests and webhook callbacks.
   */
  @Post('upload')
  @HttpCode(HttpStatus.OK)
  async handleUpload(
    @Req() request: any,
    @Body() body: any,
  ): Promise<any> {
    const result = await this.mediaService.handleVercelBlobUpload(request, body);
    return { success: true, ...result };
  }

  /**
   * Delete a media blob (Vercel Blob + Postgres).
   */
  @Delete(MEDIA_ROUTES.BY_ID)
  @UseGuards(JwtAuthGuard)
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
    createdAt: Date;
  }): MediaResponseDto {
    return {
      id: media.id,
      noteId: media.noteId,
      spaceId: media.spaceId,
      mimeType: media.mimeType,
      sizeBytes: media.sizeBytes,
      url: media.url,
      createdAt: media.createdAt,
    };
  }
}
