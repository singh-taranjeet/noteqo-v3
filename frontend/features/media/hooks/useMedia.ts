import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaService } from "../services/media.service";
import type { MediaResponseDto, DecryptedMedia } from "../types/media.types";
import { cryptoService } from "@/features/crypto";
import { spaceService } from "@/features/spaces";

export function useMediaList(spaceId?: string) {
  return useQuery({
    queryKey: ["media", spaceId],
    queryFn: async (): Promise<DecryptedMedia[]> => {
      if (!spaceId) return [];
      let mediaList: MediaResponseDto[] = [];
      try {
        mediaList = await mediaService.getRemoteMediaList(spaceId);
      } catch (err) {
        console.warn("Falling back to local media cache", err);
        mediaList = await mediaService.getLocalMediaList(spaceId);
      }

      return Promise.all(
        mediaList.map(async (media) => {
          let title = "";
          let description = "";
          return { ...media, title, description };
        }),
      );
    },
    enabled: !!spaceId,
  });
}

export function useUpdateMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      mediaId: string;
      spaceId: string;
      data: { title?: string; description?: string };
    }) => {
      const { mediaId, spaceId, data } = params;
      const spaceKeyBase64 = await spaceService.getCachedSpaceKey(spaceId);
      if (!spaceKeyBase64) throw new Error("Space key not found");
      const spaceKeyBytes = new Uint8Array(
        cryptoService.decodeBase64(spaceKeyBase64),
      );

      const metaStr = JSON.stringify({
        title: data.title,
        description: data.description,
      });
      const encryptedMeta = await cryptoService.encryptString(
        metaStr,
        spaceKeyBytes,
      );

      return mediaService.updateMedia(mediaId, { meta: encryptedMeta });
    },
    onSuccess: (updatedMedia) => {
      queryClient.invalidateQueries({
        queryKey: ["media", updatedMedia.spaceId],
      });
      // Also invalidate global 'all' media queries
      queryClient.invalidateQueries({
        queryKey: ["media", "all"],
      });
    },
  });
}

export function useAllMediaList(spaceIds: string[]) {
  return useQuery({
    queryKey: ["media", "all", spaceIds],
    queryFn: async (): Promise<DecryptedMedia[]> => {
      if (!spaceIds?.length) return [];

      const results = await mediaService.getAllMediaList(spaceIds);
      return results
        .flat()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    },
    enabled: spaceIds?.length > 0,
  });
}
