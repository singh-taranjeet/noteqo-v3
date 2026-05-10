import { getQueryClient } from "@/components/Providers/Providers";
import { QueryKeys } from "@/features/shared/constants/index.shared.constants";
import type { Space } from "@/features/spaces/types/spaces.types";
import { db } from "@/features/storage";
export const SpaceLocalService = {
  client: () => {
    const queryClient = getQueryClient();
    return queryClient;
  },
  create: async (space: Space) => {
    await db.spaces.put(space);
  },
  bulkPut: async (spaces: Space[]) => {
    await db.spaces.bulkPut(spaces);
  },
  getAll: async () => {
    return SpaceLocalService.client().fetchQuery({
      queryKey: [QueryKeys.space.local.all],
      queryFn: async () => {
        return db.spaces.toArray();
      },
    });
  },
  get: async (id: string) => {
    return SpaceLocalService.client().fetchQuery({
      queryKey: [QueryKeys.space.local.get(id)],
      queryFn: async () => {
        return db.spaces.get(id);
      },
    });
  },
};
