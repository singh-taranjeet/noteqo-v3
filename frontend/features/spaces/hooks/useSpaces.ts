import { useQuery } from "@tanstack/react-query";
import { spaceService } from "../services/space.service";

export const SPACES_QUERY_KEY = ["spaces"] as const;

export function useSpaces() {
  const query = useQuery({
    queryKey: SPACES_QUERY_KEY,
    queryFn: async () => {
      const spaces = await spaceService.getAllSpaces();
      return spaces;
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
