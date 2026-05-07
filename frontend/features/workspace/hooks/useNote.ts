"use client";

import { useEffect, useState } from "react";
import { noteService } from "../services/note.service";
import type { Note } from "../types/workspace.types";
import { isOnline } from "@/lib/utils";

export function useNote(params: {
  id?: string;
  initialNote?: Note;
  readonly?: boolean;
}) {
  const { id, initialNote, readonly = false } = params;
  const [note, setNote] = useState<Note | undefined>(initialNote);
  const [loading, setLoading] = useState(!initialNote);
  const [prevInitialNote, setPrevInitialNote] = useState<Note | undefined>(
    initialNote,
  );

  if (initialNote !== prevInitialNote) {
    setPrevInitialNote(initialNote);
    setNote(initialNote);
    setLoading(false);
  }

  useEffect(() => {
    async function loadNote() {
      if (id && !initialNote) {
        // If the user is online and mode is not readonly then it will fetch the remote note
        // GetRemoteNote will invalidate the loalNote query
        if (isOnline() && !readonly) {
          setLoading(true);
          await noteService.getRemoteNote(id);
        }
        const localNote = await noteService.getLocalNote(id);

        setNote(localNote);
        setLoading(false);
      }
    }

    void loadNote();
  }, [id, initialNote, readonly]);

  return {
    note,
    loading,
    setNote,
  };
}
