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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Initial Note", initialNote);
    async function loadNote() {
      if (id) {
        // If the user is online and mode is not readonly then it will fetch the remote note
        // GetRemoteNote will invalidate the loalNote query
        if (isOnline() && !readonly) {
          setLoading(true);
          await noteService.getRemoteNote(id);
        }
        const localNote = await noteService.getLocalNote(id);
        // console.log("Local Note", localNote);
        setNote(localNote);
        setLoading(false);
      }
    }

    if (initialNote) {
      setNote(initialNote);
      setLoading(false);
    } else {
      loadNote();
    }
  }, [id, initialNote, readonly]);

  return {
    note,
    loading,
    setNote,
  };
}
