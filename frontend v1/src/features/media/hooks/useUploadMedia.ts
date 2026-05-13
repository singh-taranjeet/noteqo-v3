import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mediaService } from "../services/media.service";
import type { MediaResponseDto } from "../types/media.types";

interface UploadMediaParams {
  file: File;
  spaceId: string;
  noteId: string;
}

/**
 * React Query mutation hook for encrypting and uploading media.
 * Provides `mutateAsync`, `isPending`, `isError`, and `data`
 * so every consumer gets consistent loading/error state for free.
 */
export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation<MediaResponseDto, Error, UploadMediaParams>({
    mutationFn: async ({ file, spaceId, noteId }) => {
      return mediaService.uploadMedia(file, spaceId, noteId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["media", variables.spaceId] });
      queryClient.invalidateQueries({ queryKey: ["media", "all"] });
    },
  });
}
