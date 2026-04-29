import { useQuery } from "@tanstack/react-query";
import { spaceService } from "../services/space.service";
import { useMemo } from "react";

export const SPACES_QUERY_KEY = ["spaces"] as const;

export function useSpaces() {
  const query = useQuery({
    queryKey: SPACES_QUERY_KEY,
    queryFn: async () => {
      return spaceService.getSpaces();
    },
    refetchInterval: 1 * 60 * 1000,
  });

  const notes = useMemo(() => {
    return query.data?.notes || [];
  }, [query.data?.notes]);

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
    data: {
      notes: query.data?.notes,
      spaces: query.data?.spaces,
    },
    isLoading: query.isLoading,
    error: query.error,
    refetchSpacesQuery: query.refetch,
    spaceNotesMap,
  };
}
