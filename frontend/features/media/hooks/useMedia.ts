import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaService } from "../services/media.service";
import type { DecryptedMedia } from "../types/media.types";
import { cryptoService } from "@/features/crypto";
import { spaceService } from "@/features/spaces";

export function useMediaList(spaceId?: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["media", spaceId],
    queryFn: async (): Promise<DecryptedMedia[]> => {
      if (!spaceId) return [];

      const localMedia = await mediaService.getLocalMediaList(spaceId);

      if (localMedia.length > 0) {
        // Trigger background sync without awaiting it
        mediaService
          .getRemoteMediaList(spaceId)
          .then((remoteMedia) => {
            queryClient.setQueryData(["media", spaceId], remoteMedia);
          })
          .catch((err) => {
            console.warn("Failed background media sync", err);
          });
        return localMedia;
      }

      // If local cache is empty, fetch from remote immediately
      try {
        return await mediaService.getRemoteMediaList(spaceId);
      } catch (err) {
        console.warn("Falling back to local media cache after error", err);
        return localMedia;
      }
    },
    enabled: !!spaceId,
    staleTime: 1000 * 60 * 10,
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
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ["media", "all", spaceIds],
    queryFn: async (): Promise<DecryptedMedia[]> => {
      if (!spaceIds?.length) return [];

      const localMedia =
        await mediaService.getLocalMediaListForSpaces(spaceIds);

      const processRemote = (remote: DecryptedMedia[]) => {
        return remote
          .flat()
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
      };

      if (localMedia.length > 0) {
        // Trigger background sync
        mediaService
          .getAllMediaList(spaceIds)
          .then((remoteMedia) => {
            queryClient.setQueryData(
              ["media", "all", spaceIds],
              processRemote(remoteMedia),
            );
          })
          .catch((err) =>
            console.warn("Failed background all-media sync", err),
          );

        return processRemote(localMedia);
      }

      const results = await mediaService.getAllMediaList(spaceIds);
      return processRemote(results);
    },
    enabled: spaceIds?.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}
