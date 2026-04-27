import { noteService } from "./note.service";
import { db } from "@/features/storage";
import type { Note } from "../types/workspace.types";
import { logService } from "@/services/log.service";

export const mergeLocalRemoteService = {
  merge: async (remoteNotes?: Note[]) => {
    try {
      // Step 1. Fetch the list of notes in our db
      const localNotes = await noteService.getAllLocalNotes();
      const localNotesMap = new Map(localNotes.map((note) => [note.id, note]));

      const notesToUpdate: Note[] = [];

      const remoteNotesFetched = await noteService.getAllLocalNotes();
      const effectiveRemoteNotes = remoteNotes || remoteNotesFetched;

      // Step 2. Compare the remote notes with the local notes. If local notes are the latest then skip it. If remote notes are the latest then update the local notes.
      for (const remoteNote of effectiveRemoteNotes) {
        const localNote = localNotesMap.get(remoteNote.id);

        if (!localNote) {
          notesToUpdate.push(remoteNote);
        } else {
          const localUpdatedAt = new Date(localNote.updatedAt).getTime();
          const remoteUpdatedAt = new Date(remoteNote.updatedAt).getTime();

          if (remoteUpdatedAt > localUpdatedAt) {
            notesToUpdate.push(remoteNote);
          }
        }
      }

      // Step 3. Push the changes into the local db
      if (notesToUpdate.length > 0) {
        logService.log("Updating local DB with notes:", notesToUpdate.length);
        await db.notes.bulkPut(notesToUpdate);
      }
    } catch (error) {
      logService.error("Failed to merge local and remote notes", error);
    }
  },
};
