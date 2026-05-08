import { cryptoService } from "@/features/crypto";
import type { Note } from "../types/workspace.types";
import { noteApiService } from "./note-api.service";
import { spaceService } from "@/features/spaces/services/space.service";
import type { SyncEvent } from "@/features/shared/types/index.shared";
import { BaseSyncQueueService } from "@/features/shared/services/baseSync.shared.service";

class NoteSyncQueueService extends BaseSyncQueueService {
  async processEvent(event: SyncEvent): Promise<void> {
    switch (event.type) {
      case "CREATE": {
        const note = event.payload as Note;
        const ciphertext = await this.encryptPayload(note);

        await noteApiService.createNote({
          id: event.entityId,
          ciphertext,
          spaceId: note.spaceId,
          type: note.type,
          isFavorite: note.isFavorite,
          parentId: note.parentId,
          createdAt: note.createdAt,
          updatedAt: this.getUpdatedAt(),
        });
        break;
      }

      case "UPDATE": {
        const note = event.payload as Note;
        const ciphertext = await this.encryptPayload(note);
        await noteApiService.updateNote({
          id: event.entityId,
          ciphertext,
          isFavorite: note.isFavorite,
          parentId: note.parentId,
          updatedAt: this.getUpdatedAt(),
        });
        break;
      }

      case "DELETE": {
        await noteApiService.deleteNote(event.entityId);
        break;
      }

      case "RESTORE": {
        await noteApiService.restoreNote(event.entityId);
        break;
      }

      case "PERMANENT_DELETE": {
        await noteApiService.permanentDeleteNote(event.entityId);
        break;
      }
    }
  }

  /**
   * Encrypt a note payload using the space key.
   *
   * 1. Resolve the space key bytes via spaceService
   * 2. Serialize the payload (title, emoji, coverImage, content) to JSON
   * 3. Encrypt with AES-GCM using cryptoService → "iv:ciphertext"
   */
  private async encryptPayload(note: Note): Promise<string> {
    const spaceKeyBytes = await spaceService.getSpaceKeyBytes(note.spaceId);

    const payloadToEncrypt = {
      title: note.title?.slice(0, 50) || "",
      emoji: note.emoji,
      coverImage: note.coverImage,
      content: note.content,
    };

    return cryptoService.encryptString(
      JSON.stringify(payloadToEncrypt),
      spaceKeyBytes,
    );
  }
}

export const noteSyncQueueService = new NoteSyncQueueService();
