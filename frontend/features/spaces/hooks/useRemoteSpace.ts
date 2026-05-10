"use client";
import { useQuery } from "@tanstack/react-query";
import { spaceService } from "../services/space.service";
import { QueryKeys } from "@/features/shared/constants/index.shared.constants";

export function useRemoteSpaces() {
  useQuery({
    queryKey: [QueryKeys.space.remote.spacesAndNote],
    queryFn: async () => {
      await spaceService.getRemoteSpacesAndNotes();
      return null;
    },
    refetchInterval: 1000 * 60,
  });
}
