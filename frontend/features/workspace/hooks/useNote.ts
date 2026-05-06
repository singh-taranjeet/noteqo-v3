"use client";

import { useEffect, useState } from "react";
import { noteService } from "../services/note.service";
import type { Note } from "../types/workspace.types";

export function useNote(id: string, initialNote: Note | null) {
  const [note, setNote] = useState<Note | null>(initialNote);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNote() {
      const n = await noteService.getLocalNote(id);
      if (n) {
        setNote(n);
        await noteService.getRemoteNote(id);
        setLoading(false);
      }
    }
    loadNote();
  }, [id]);

  return {
    note,
    isReady: loading,
    setNote,
  };
}
