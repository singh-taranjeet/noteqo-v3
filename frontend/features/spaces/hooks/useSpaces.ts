import { useQuery } from "@tanstack/react-query";
import { spaceService } from "../services/space.service";
import { useMemo } from "react";

export const SPACES_QUERY_KEY = ["spaces"] as const;

export function useSpaces() {
  const query = useQuery({
    queryKey: SPACES_QUERY_KEY,
    queryFn: async () => {
      return spaceService.getAllSpaces();
    },
    refetchInterval: 60 * 1000
  });

  const notes = query.data?.notes || []

  const spaceNotesMap = useMemo(() => {
    return notes.reduce(
      (acc, note) => {
        if (!acc[note.spaceId]) acc[note.spaceId] = [];
        acc[note.spaceId].push(note);
        return acc;
      },
      {} as Record<string, typeof notes>,
    );
  }, [notes]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    spaceNotesMap
  };
}
