import * as Y from "yjs";
import { db } from "@/features/storage";
import { logService } from "@/services/log.service";

/**
 * Persists Yjs document state to Dexie (IndexedDB) for offline-first support.
 *
 * On page load, the Yjs doc is hydrated from Dexie before connecting to
 * the WebSocket server. This ensures the editor shows the last known state
 * even when offline.
 */
export const yjsPersistenceService = {
  /**
   * Saves the current Yjs document state to Dexie.
   * Called periodically and before the provider is destroyed.
   */
  async saveState(noteId: string, doc: Y.Doc): Promise<void> {
    try {
      const state = Y.encodeStateAsUpdate(doc);
      const stateVector = Y.encodeStateVector(doc);

      await db.yjsState.put({
        noteId,
        state: new Blob([state as any]),
        stateVector: new Blob([stateVector as any]),
        updatedAt: Date.now(),
      });
    } catch (err) {
      logService.error(`Failed to persist Yjs state for note ${noteId}`, err);
    }
  },

  /**
   * Loads persisted Yjs state from Dexie into the document.
   * Called during provider initialization (before WebSocket connect).
   */
  async loadState(noteId: string, doc: Y.Doc): Promise<void> {
    try {
      const entry = await db.yjsState.get(noteId);
      if (!entry) return;

      const stateBuffer = await entry.state.arrayBuffer();
      const state = new Uint8Array(stateBuffer);

      Y.applyUpdate(doc, state);
      logService.info(
        `Loaded persisted Yjs state for note ${noteId} (${state.byteLength} bytes)`,
      );
    } catch (err) {
      logService.error(`Failed to load Yjs state for note ${noteId}`, err);
    }
  },

  /**
   * Deletes persisted Yjs state for a note (e.g., after permanent delete).
   */
  async deleteState(noteId: string): Promise<void> {
    try {
      await db.yjsState.delete(noteId);
    } catch (err) {
      logService.error(`Failed to delete Yjs state for note ${noteId}`, err);
    }
  },

  /**
   * Clears all persisted Yjs states (e.g., on logout).
   */
  async clearAll(): Promise<void> {
    try {
      await db.yjsState.clear();
    } catch (err) {
      logService.error("Failed to clear all Yjs states", err);
    }
  },
};
