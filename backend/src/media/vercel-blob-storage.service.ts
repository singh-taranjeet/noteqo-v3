import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { put, del } from '@vercel/blob';
import { CONFIG_KEYS } from '../config';

import { MEDIA_CONFIG } from './constants/media.constants';

/**
 * Service for interacting with Vercel Blob storage.
 *
 * All blobs stored here are pre-encrypted on the client — this service
 * deals only with opaque bytes and never holds decryption keys.
 */
@Injectable()
export class VercelBlobStorageService {
  private readonly token: string;

  constructor(private readonly configService: ConfigService) {
    const blobConfig = this.configService.get(CONFIG_KEYS.VERCEL_BLOB);
    this.token = blobConfig.token;
  }

  /**
   * Upload an encrypted blob to Vercel Blob.
   * @param key - The storage path (e.g. "media/{spaceId}/{mediaId}")
   * @param body - The encrypted file bytes
   * @returns The Vercel Blob URL
   */
  async upload(key: string, body: Buffer): Promise<string> {
    const blob = await put(key, body, {
      access: MEDIA_CONFIG.VERCEL_BLOB_ACCESS as 'public', // Encrypted content is safe to be public
      token: this.token,
      contentType: MEDIA_CONFIG.DEFAULT_CONTENT_TYPE,
    });
    return blob.url;
  }

  /**
   * Delete an encrypted blob from Vercel Blob.
   * @param url - The Vercel Blob URL
   */
  async delete(url: string): Promise<void> {
    await del(url, { token: this.token });
  }
}
