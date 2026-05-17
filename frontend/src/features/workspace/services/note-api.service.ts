import { apiClient } from "@/services/api";
import { WORKSPACE_API_ROUTES } from "@/features/workspace/constants/workspace.constants";
import type { Note, RemoteNote } from "../types/workspace.types";
import { noteService } from "./note.service";
import { NoteLocalService } from "./note-local.service";
import { noteSyncQueueService } from "./note-sync-queue.service";
import { SYNC_ENTITY, SYNC_EVENT_TYPE } from "@/features/shared/types/index.shared";

export const noteApiService = {
  getNote: async (id: string): Promise<Note | undefined> => {
    try {
      const response: { data: RemoteNote } = await apiClient.get(
        `${WORKSPACE_API_ROUTES.NOTES}/${id}`,
        { auth: true },
      );

      const decryptedNote = await noteService.decryptNote(response.data);
      return decryptedNote ?? undefined;
    } catch {
      return undefined;
    }
  },



  handleInboundNote: async (event: {
    noteId: string;
    version: number;
  }): Promise<void> => {
    console.log("Handling upate", event.version);
    // QUICK CHECK — skip fetch entirely if we already have this version
    const localBefore = await NoteLocalService.get(event.noteId);
    if (localBefore && event.version <= localBefore.remoteVersion) {
      console.log("We have this same version")
      return
    };

    // Fetch + decrypt the full note from server
    const serverNote = await noteApiService.getNote(event.noteId);
    if (!serverNote) return;
    console.log("Got the server note", serverNote);

    // RE-READ local note AFTER fetch — the user may have started
    // typing during the network round-trip + decryption time
    const localAfter = await NoteLocalService.get(event.noteId);
    console.log("compareing versions", JSON.stringify(serverNote.content) === JSON.stringify(localAfter?.content));

    // GUARD 1 — Version: skip if local is already up-to-date
    if (localAfter && serverNote.remoteVersion <= localAfter.remoteVersion) {
      console.log("Guard 1 : We have this same version")
      return;
    }

    // GUARD 2 — Dirty: if note became dirty during fetch,
    // only update remoteVersion (so next sync uses correct baseVersion).
    if (localAfter?.isDirty) {
      // the changes of this user are not yet uploaded to remote, 
      // so we need to create a local conflict here
      console.log("Local note was dirtly created a copy");
      return;
    }
    // Note is clean — safe to overwrite with remote content
    console.log("Finally< Local note is updaed");
    await NoteLocalService.update(event.noteId, {
      ...serverNote,
      content: serverNote.content,
      remoteVersion: serverNote.remoteVersion,
    });
  },

  createNote: async (payload: {
    id: string;
    ciphertext: string;
    spaceId: string;
    type: string;
    isFavorite?: boolean;
    parentId?: string | null;
    createdAt: string;
    updatedAt: string;
  }): Promise<RemoteNote> => {
    const res: { data: RemoteNote } = await apiClient.post(
      WORKSPACE_API_ROUTES.NOTES,
      payload,
      { auth: true },
    );
    return res.data;
  },

  updateNote: async (payload: {
    id: string;
    ciphertext: string;
    baseVersion: number;
    isFavorite?: boolean;
    parentId?: string | null;
    updatedAt: string;
  }): Promise<RemoteNote> => {
    const res: { data: RemoteNote } = await apiClient.patch(
      `${WORKSPACE_API_ROUTES.NOTES}/${payload.id}`,
      {
        ciphertext: payload.ciphertext,
        baseVersion: payload.baseVersion,
        updatedAt: payload.updatedAt,
        isFavorite: payload.isFavorite,
        parentId: payload.parentId,
      },
      { auth: true },
    );
    return res.data;
  },

  deleteNote: async (id: string): Promise<void> => {
    await apiClient.delete(`${WORKSPACE_API_ROUTES.NOTES}/${id}`, {
      auth: true,
    });
  },

  restoreNote: async (id: string): Promise<void> => {
    await apiClient.post(
      `${WORKSPACE_API_ROUTES.NOTES}/${id}/restore`,
      {},
      { auth: true },
    );
  },

  permanentDeleteNote: async (id: string): Promise<void> => {
    await apiClient.delete(
      `${WORKSPACE_API_ROUTES.NOTES}/${id}/permanent-delete`,
      { auth: true },
    );
  },
};
