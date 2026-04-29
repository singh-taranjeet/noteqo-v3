import { Injectable, NotFoundException } from '@nestjs/common';
import { MediaRepository } from './media.repository';
import { Media } from './types/media.types';
import { UploadMediaDto } from './dto/upload-media.dto';
import { MEDIA_CONFIG } from './constants/media.constants';
import { VercelBlobStorageService } from './vercel-blob-storage.service';

@Injectable()
export class MediaService {
  constructor(
    private readonly mediaRepository: MediaRepository,
    private readonly blobStorage: VercelBlobStorageService,
  ) {}

  /**
   * Uploads an encrypted media blob to Vercel Blob and records metadata.
   * @param dto - Upload metadata (id, noteId, spaceId, mimeType, sizeBytes)
   * @param encryptedBlob - The pre-encrypted file bytes from the client
   */
  async upload(dto: UploadMediaDto, encryptedBlob: Buffer): Promise<Media> {
    const storageKey = `${MEDIA_CONFIG.STORAGE_PREFIX}/${dto.spaceId}/${dto.id}`;

    // 1. Upload encrypted blob to Vercel Blob
    const url = await this.blobStorage.upload(storageKey, encryptedBlob);

    // 2. Save metadata in Postgres via repository
    return this.mediaRepository.create(dto, url);
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
