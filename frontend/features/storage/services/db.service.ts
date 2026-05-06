import Dexie from "dexie";
import type { Table } from "dexie";
import { STORAGE_CONFIG } from "../constants/storage.constants";
import type { Note, SyncEvent } from "@/features/workspace";
import type { Space } from "@/features/spaces";

import type { DecryptedMedia } from "@/features/media";

/** Shape of a key-value entry in the keys table (migrated from raw IndexedDB). */
interface KeyEntry {
  key: string;
  value: unknown;
}

/** Shape of a cached decrypted media blob entry. */
export interface MediaBlobEntry {
  /** Vercel Blob URL — primary key */
  url: string;
  /** Decrypted blob data */
  blob: Blob;
  /** MIME type for reconstructing the Blob */
  mimeType: string;
  /** Original file size in bytes */
  sizeBytes: number;
  /** Last access timestamp (epoch ms) for future LRU eviction */
  accessedAt: number;
}

/**
 * Single Dexie database for the entire Noteqo app.
 * Replaces the raw IndexedDB wrapper — all tables in one DB.
 */
class NoteqoDB extends Dexie {
  keys!: Table<KeyEntry, string>;
  notes!: Table<Note, string>;
  syncQueue!: Table<SyncEvent, string>;
  spaces!: Table<Space, string>;
  mediaBlobs!: Table<MediaBlobEntry, string>;
  media!: Table<DecryptedMedia, string>;

  constructor() {
    super(STORAGE_CONFIG.DB_NAME);

    this.version(STORAGE_CONFIG.DB_VERSION).stores({
      keys: "key",
      notes: "id, spaceId, parentId, updatedAt, title, emoji",
      syncQueue: "id, entityId, createdAt, syncStatus",
      spaces: "id, type",
      mediaBlobs: "url",
      media: "id, spaceId, createdAt",
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

/** Expose the raw Dexie instance for direct table access (documents, syncQueue, mediaBlobs). */
export { db };
