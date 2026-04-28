import { useMutation, useQueryClient } from "@tanstack/react-query";
import { spaceService } from "../services/space.service";
import { logService } from "@/services/log.service";
import type { Space, SpaceType } from "../types/spaces.types";
import { SPACES_QUERY_KEY } from "./useSpaces";

export function useCreateSpace() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      name,
      type,
    }: {
      name?: string;
      type?: SpaceType;
    }): Promise<Space | null> => {
      return await spaceService.createSpace(name, type);
    },
    onSuccess: () => {
      // Invalidate spaces query to automatically refresh the list
      void queryClient.invalidateQueries({ queryKey: SPACES_QUERY_KEY });
    },
    onError: (err) => {
      logService.error("Failed to create space", err);
    },
  });

  return {
    createSpace: async (name?: string, type?: SpaceType) =>
      mutation.mutateAsync({ name, type }),
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
