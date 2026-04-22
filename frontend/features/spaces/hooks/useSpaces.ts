import { useState, useCallback, useEffect } from "react";
import { spaceService } from "../services/space.service";
import { logService } from "@/services/log.service";
import type { Space } from "../types/spaces.types";

export function useSpaces() {
  const [data, setData] = useState<Space[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSpaces = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const spaces = await spaceService.getAllSpaces();
      setData(spaces);
    } catch (err) {
      logService.error("Failed to fetch spaces", err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchSpaces();
  }, [fetchSpaces]);

  return { data, isLoading, error, refetch: fetchSpaces };
}
