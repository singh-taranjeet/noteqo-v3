import { spaceService } from "./space.service";
import type { SyncEvent, SyncEntity } from "@/types/sync.types";
import { BaseSyncQueueService } from "@/services/base-sync.service";
import { spaceApiService } from "./space-api.service";
import type { SpaceType } from "../types/spaces.types";

class SpaceSyncQueueService extends BaseSyncQueueService {
  protected readonly entityType: SyncEntity = "space";

  async processEvent(event: SyncEvent): Promise<void> {
    switch (event.type) {
      case "CREATE": {
        const space = event.payload as {
          name: string;
          type: SpaceType;
          id: string;
          now: string;
          ownerKeySlot: string;
          spaceKeyBytes: Uint8Array<ArrayBufferLike>;
        };

        const encryptedName = await spaceService.encryptWithSpaceKey(
          space.name,
          space.spaceKeyBytes,
        );

        await spaceApiService.create({
          id: space.id,
          encryptedName,
          type: space.type,
          ownerKeySlot: space.ownerKeySlot,
          createdAt: space.now,
          updatedAt: space.now,
        });
        break;
      }

      case "UPDATE": {
        const space = event.payload as {
          id: string;
          name: string;
          spaceKeyBytes: Uint8Array<ArrayBufferLike>;
        };

        const encryptedName = await spaceService.encryptWithSpaceKey(
          space.name,
          space.spaceKeyBytes,
        );

        await spaceApiService.update(space.id, {
          encryptedName,
          updatedAt: this.getUpdatedAt(),
        });
        break;
      }

      case "DELETE": {
        await spaceApiService.deleteSpace(event.entityId);
        break;
      }
    }
  }
}

export const spaceSyncQueueService = new SpaceSyncQueueService();
