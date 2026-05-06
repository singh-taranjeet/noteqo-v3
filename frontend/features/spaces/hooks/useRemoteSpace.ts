"use client";
import { useQuery } from "@tanstack/react-query";
import { spaceService } from "../services/space.service";
import { SPACES_QUERY_KEY } from "../constants/spaces.constants";

export function useRemoteSpaces() {
  useQuery({
    queryKey: [SPACES_QUERY_KEY.REMOTE_SPACES],
    queryFn: async () => {
      await spaceService.getRemoteSpacesAndNotes();
      return null;
    },
    refetchInterval: 1000 * 3,
  });
}
