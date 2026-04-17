import Dexie from "dexie";
import type { Table } from "dexie";
import { STORAGE_CONFIG } from "../constants/storage.constants";
import type {
  Document,
  SyncEvent,
} from "@/features/workspace/types/workspace.types";

/** Shape of a key-value entry in the keys table (migrated from raw IndexedDB). */
interface KeyEntry {
  key: string;
  value: unknown;
}

/**
 * Single Dexie database for the entire Noteqo app.
 * Replaces the raw IndexedDB wrapper — all tables in one DB.
 */
class NoteqoDB extends Dexie {
  keys!: Table<KeyEntry, string>;
  documents!: Table<Document, string>;
  syncQueue!: Table<SyncEvent, string>;

  constructor() {
    super(STORAGE_CONFIG.DB_NAME);

    this.version(STORAGE_CONFIG.DB_VERSION).stores({
      keys: "key",
      documents: "id, syncStatus, updatedAt",
      syncQueue: "id, entityId, createdAt",
    });
  }
}

const db = new NoteqoDB();

/**
 * Key-value storage service — drop-in replacement for the old IndexedDBService.
 * Same API surface so existing consumers (useRegister, etc.) don't change.
 */
export const storageService = {
  async put(key: string, value: unknown): Promise<void> {
    await db.keys.put({ key, value });
  },

  async get<T>(key: string): Promise<T | null> {
    const entry = await db.keys.get(key);
    return (entry?.value as T) ?? null;
  },

  async delete(key: string): Promise<void> {
    await db.keys.delete(key);
  },

  async clear(): Promise<void> {
    await db.keys.clear();
  },
};

/** Expose the raw Dexie instance for direct table access (documents, syncQueue). */
export { db };
