import {
  Controller,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { UploadMediaDto } from './dto/upload-media.dto';
import { MediaResponseDto } from './dto/media-response.dto';
import { MEDIA_ROUTES, MEDIA_CONFIG } from './constants/media.constants';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller(MEDIA_ROUTES.BASE)
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  /**
   * Upload an encrypted media blob.
   * The client encrypts the file before sending — the server stores opaque bytes.
   *
   * Multipart form:
   *  - file: the encrypted blob
   *  - id, noteId, spaceId, mimeType, sizeBytes: metadata fields
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor(MEDIA_CONFIG.UPLOAD_FIELD_NAME, {
      limits: { fileSize: MEDIA_CONFIG.MAX_FILE_SIZE_BYTES },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadMediaDto,
  ): Promise<MediaResponseDto> {
    const media = await this.mediaService.upload(dto, file.buffer);
    return this.mapToResponse(media);
  }

  /**
   * Delete a media blob (Vercel Blob + Postgres).
   */
  @Delete(MEDIA_ROUTES.BY_ID)
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
