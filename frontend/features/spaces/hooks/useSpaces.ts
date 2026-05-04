import { useQuery } from "@tanstack/react-query";
import { spaceService } from "../services/space.service";
import { useMemo } from "react";
import type { NoteTreeNode } from "@/features/workspace/types/workspace.types";

export const SPACES_QUERY_KEY = ["spaces"] as const;

export function useSpaces() {
  const query = useQuery({
    queryKey: SPACES_QUERY_KEY,
    queryFn: async () => {
      return spaceService.getSpaces();
    },
    refetchInterval: 1 * 60 * 1000,
  });

  const activeNotes = useMemo(() => {
    return (query.data?.notes || []).filter(n => !n.deletedAt);
  }, [query.data?.notes]);

  const trashedNotes = useMemo(() => {
    return (query.data?.notes || []).filter(n => !!n.deletedAt);
  }, [query.data?.notes]);

  const spaceNotesMap = useMemo(() => {
    // Sort notes by updatedAt desc globally
    const sortedNotes = [...activeNotes].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

    return sortedNotes.reduce(
      (acc, note) => {
        if (!acc[note.spaceId]) acc[note.spaceId] = [];
        acc[note.spaceId].push(note);
        return acc;
      },
      {} as Record<string, typeof activeNotes>,
    );
  }, [activeNotes]);

  const spaceNoteTreesMap = useMemo(() => {
    const trees: Record<string, NoteTreeNode[]> = {};
    Object.entries(spaceNotesMap).forEach(([spaceId, spaceNotes]) => {
      // spaceNotes is already sorted by updatedAt desc

      const nodeMap = new Map<string, NoteTreeNode>();
      const rootNodes: NoteTreeNode[] = [];

      spaceNotes.forEach((note) => {
        nodeMap.set(note.id, { ...note, children: [] });
      });

      spaceNotes.forEach((note) => {
        const node = nodeMap.get(note.id)!;
        if (note.parentId && nodeMap.has(note.parentId)) {
          const parent = nodeMap.get(note.parentId)!;
          parent.children.push(node);
        } else {
          rootNodes.push(node);
        }
      });

      trees[spaceId] = rootNodes;
    });
    return trees;
  }, [spaceNotesMap]);

  return {
    data: {
      notes: query.data?.notes,
      spaces: query.data?.spaces,
    },
    isLoading: query.isLoading,
    error: query.error,
    refetchSpacesQuery: query.refetch,
    spaceNotesMap,
    spaceNoteTreesMap,
    trashedNotes,
  };
}
