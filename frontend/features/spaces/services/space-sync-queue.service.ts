import { spaceService } from "@/features/spaces/services/space.service";
import type { SyncEvent } from "@/features/shared/types/index.shared";
import { BaseSyncQueueService } from "@/features/shared/services/baseSync.shared.service";
import { spaceApiService } from "./space-api.service";
import type { SpaceType } from "../types/spaces.types";

class SpaceSyncQueueService extends BaseSyncQueueService {
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
    }
  }
}

export const spaceSyncQueueService = new SpaceSyncQueueService();
