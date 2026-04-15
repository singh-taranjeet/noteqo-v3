import { STORAGE_CONFIG } from '../constants/storage.constants';

/**
 * A native Promise-based wrapper around IndexedDB for securely
 * persisting keys in the browser.
 */
class IndexedDBService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return reject(new Error('IndexedDB is not available'));
      }

      const request = window.indexedDB.open(STORAGE_CONFIG.DB_NAME, STORAGE_CONFIG.DB_VERSION);

      request.onerror = () => {
        this.dbPromise = null;
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        // Create the key store if it doesn't exist
        if (!db.objectStoreNames.contains(STORAGE_CONFIG.STORES.KEYS)) {
          db.createObjectStore(STORAGE_CONFIG.STORES.KEYS);
        }
      };
    });

    return this.dbPromise;
  }

  /**
   * Put an item in the key store
   */
  async put(key: string, value: unknown): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORAGE_CONFIG.STORES.KEYS], 'readwrite');
      const store = transaction.objectStore(STORAGE_CONFIG.STORES.KEYS);
      const request = store.put(value, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to put key ${key}`));
      transaction.onerror = () => reject(new Error(`Transaction failed for ${key}`));
    });
  }

  /**
   * Get an item from the key store
   */
  async get<T>(key: string): Promise<T | null> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORAGE_CONFIG.STORES.KEYS], 'readonly');
      const store = transaction.objectStore(STORAGE_CONFIG.STORES.KEYS);
      const request = store.get(key);

      request.onsuccess = () => resolve((request.result as T) ?? null);
      request.onerror = () => reject(new Error(`Failed to get key ${key}`));
    });
  }

  /**
   * Delete an item from the key store
   */
  async delete(key: string): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORAGE_CONFIG.STORES.KEYS], 'readwrite');
      const store = transaction.objectStore(STORAGE_CONFIG.STORES.KEYS);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error(`Failed to delete key ${key}`));
    });
  }

  /**
   * Clear all items from the key store
   */
  async clear(): Promise<void> {
    const db = await this.initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORAGE_CONFIG.STORES.KEYS], 'readwrite');
      const store = transaction.objectStore(STORAGE_CONFIG.STORES.KEYS);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear key store'));
    });
  }
}

export const storageService = new IndexedDBService();
