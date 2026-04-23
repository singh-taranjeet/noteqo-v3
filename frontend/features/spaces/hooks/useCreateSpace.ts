import { useState, useCallback } from "react";
import { spaceService } from "../services/space.service";
import { logService } from "@/services/log.service";
import type { Space, SpaceType } from "../types/spaces.types";

export function useCreateSpace() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const createSpace = useCallback(
    async (name?: string, type?: SpaceType): Promise<Space | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const space = await spaceService.createSpace(name, type);
        return space;
      } catch (err) {
        logService.error("Failed to create space", err);
        setError(err instanceof Error ? err : new Error(String(err)));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { createSpace, isLoading, error };
}
