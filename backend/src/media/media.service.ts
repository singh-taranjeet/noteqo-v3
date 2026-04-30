import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { MediaRepository } from './media.repository';
import { Media } from './types/media.types';
import { UploadMediaDto } from './dto/upload-media.dto';
import { MEDIA_CONFIG } from './constants/media.constants';
import { VercelBlobStorageService } from './vercel-blob-storage.service';

import { handleUpload } from '@vercel/blob/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CONFIG_KEYS } from '../config';

@Injectable()
export class MediaService {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly blobStorage: VercelBlobStorageService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Handle the Vercel Blob client upload flow.
   * - Validates the JWT embedded in the clientPayload during onBeforeGenerateToken.
   * - Saves the resulting metadata and URL to the DB during onUploadCompleted.
   */
  async handleVercelBlobUpload(request: any, body: any): Promise<any> {
    const blobConfig = this.configService.get(CONFIG_KEYS.VERCEL_BLOB);
    
    return handleUpload({
      body,
      request,
      token: blobConfig.token,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let payloadObj: any;
        try {
          payloadObj = JSON.parse(clientPayload || '{}');
        } catch {
          throw new UnauthorizedException('Invalid client payload');
        }

        const { token, spaceId, noteId, mimeType, sizeBytes, id } = payloadObj;

        if (!token) {
          throw new UnauthorizedException('Missing authentication token');
        }

        try {
          this.jwtService.verify(token);
        } catch (e) {
          throw new UnauthorizedException('Invalid authentication token');
        }

        return {
          maximumSizeInBytes: MEDIA_CONFIG.MAX_FILE_SIZE_BYTES,
          tokenPayload: JSON.stringify({
            id,
            spaceId,
            noteId,
            mimeType,
            sizeBytes,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        if (!tokenPayload) return;
        
        try {
          const payloadObj = JSON.parse(tokenPayload);
          const { id, spaceId, noteId, mimeType, sizeBytes } = payloadObj;
          
          await this.mediaRepository.create(
            { id, spaceId, noteId, mimeType, sizeBytes: parseInt(sizeBytes, 10) },
            blob.url,
          );
        } catch (err) {
          console.error('Failed to process upload completed webhook', err);
        }
      },
    });
  }

  /**
   * Deletes media from both Vercel Blob and Postgres.
   */
  async delete(mediaId: string): Promise<void> {
    const media = await this.mediaRepository.findById(mediaId);

    if (!media) {
      throw new NotFoundException(`Media ${mediaId} not found`);
    }

    // Delete from Vercel Blob first, then from Postgres
    await this.blobStorage.delete(media.url);
    await this.mediaRepository.deleteById(mediaId);
  }

  /**
   * Deletes all media associated with a note.
   */
  async deleteAllForNote(noteId: string): Promise<void> {
    const mediaItems = await this.mediaRepository.findByNoteId(noteId);

    for (const media of mediaItems) {
      await this.blobStorage.delete(media.url);
    }

    await this.mediaRepository.deleteByNoteId(noteId);
  }
}
