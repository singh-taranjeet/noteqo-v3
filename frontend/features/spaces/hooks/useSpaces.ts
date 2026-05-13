"use client";

import { useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/features/storage";
import type { NoteTreeNode } from "@/features/workspace/types/workspace.types";

export function useSpaces() {
  const spaces = useLiveQuery(() => db.spaces.toArray(), []);
  const notes = useLiveQuery(
    () => db.notes.orderBy("updatedAt").reverse().toArray(),
    [],
  );

  const activeNotes = useMemo(() => {
    return (notes || []).filter((n) => !n.deletedAt);
  }, [notes]);

  const trashedNotes = useMemo(() => {
    return (notes || []).filter((n) => !!n.deletedAt);
  }, [notes]);

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
      notes,
      spaces,
    },
    isLoading: spaces === undefined || notes === undefined,
    error: null,
    spaceNotesMap,
    spaceNoteTreesMap,
    trashedNotes,
  };
}
