import { Injectable, Logger } from '@nestjs/common';
import { CollaborationRepository } from './collaboration.repository';
import { COLLABORATION_CONFIG } from './constants/collaboration.constants';
import type { ReceiveUpdatePayload } from './types/collaboration.types';

/**
 * Orchestrates Yjs update persistence and cleanup.
 *
 * The server is a "dumb relay" — it stores and forwards encrypted blobs
 * without ever decrypting them. All CRDT merge logic happens client-side.
 */
@Injectable()
export class CollaborationService {
  private readonly logger = new Logger(CollaborationService.name);
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly repository: CollaborationRepository) {}

  /**
   * Persists an encrypted Yjs update and returns the relay payload.
   */
  async persistUpdate(
    noteId: string,
    encryptedUpdate: string,
    senderId: string,
  ): Promise<ReceiveUpdatePayload> {
    const sequenceNumber = await this.repository.saveUpdate(
      noteId,
      encryptedUpdate,
    );

    return {
      noteId,
      encryptedUpdate,
      sequenceNumber,
      senderId,
    };
  }

  /**
   * Retrieves missed encrypted updates for catch-up after reconnect.
   */
  async getCatchupUpdates(
    noteId: string,
    lastSequenceNumber: number,
    requesterId: string,
  ): Promise<ReceiveUpdatePayload[]> {
    const entities = await this.repository.getUpdatesAfter(
      noteId,
      lastSequenceNumber,
    );

    return entities.map((entity) => ({
      noteId: entity.noteId,
      encryptedUpdate: entity.encryptedUpdate.toString('utf8'),
      sequenceNumber: Number(entity.sequenceNumber),
      senderId: requesterId, // The requester is replaying — senderId is informational
    }));
  }

  /**
   * Saves a compacted full-state snapshot, replacing all prior updates.
   */
  async compact(
    noteId: string,
    encryptedState: string,
  ): Promise<number> {
    const sequenceNumber = await this.repository.saveCompactedState(
      noteId,
      encryptedState,
    );

    this.logger.log(
      `Compacted note ${noteId} at sequence ${sequenceNumber}`,
    );

    return sequenceNumber;
  }

  /**
   * Starts the periodic cleanup of expired Yjs updates.
   * Called on module init.
   */
  startCleanupScheduler(): void {
    this.cleanupTimer = setInterval(async () => {
      try {
        const deleted = await this.repository.deleteExpiredUpdates();
        if (deleted > 0) {
          this.logger.log(
            `Cleaned up ${deleted} expired Yjs updates (>${COLLABORATION_CONFIG.UPDATE_RETENTION_DAYS} days old)`,
          );
        }
      } catch (err) {
        this.logger.error('Failed to cleanup expired Yjs updates', err);
      }
    }, COLLABORATION_CONFIG.CLEANUP_INTERVAL_MS);
  }

  /**
   * Stops the cleanup scheduler.
   * Called on module destroy.
   */
  stopCleanupScheduler(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }
}
