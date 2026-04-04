import { cryptoService } from "@/features/crypto";
import { storageService, STORAGE_KEYS, db } from "@/features/storage";
import { logService } from "@/services/log.service";

const TEMP_KEYS_LOCAL_STORAGE = "TEMP_KEYS_LOCAL_STORAGE";

function removeTempStorage() {
  localStorage.removeItem(TEMP_KEYS_LOCAL_STORAGE);
}

export const KeysService = {
  // This is invoked at registeration and will store the keys in localStorage
  generateTempKeys: async () => {
    const masterKey = cryptoService.generateMasterKey();

    const { publicKey, privateKey } = await cryptoService.generateKeyPair();

    const encryptedPrivateKey = await cryptoService.encryptPrivateKey(
      privateKey,
      masterKey,
    );

    localStorage.setItem(
      TEMP_KEYS_LOCAL_STORAGE,
      JSON.stringify({
        masterKey,
        privateKey,
        publicKey,
      }),
    );

    return {
      encryptedPrivateKey,
      masterKey,
      publicKey,
    };
  },
  isMasterInLocalStorage: async (
    payloadPublicKey: string,
  ): Promise<string | boolean> => {
    const keys = localStorage.getItem(TEMP_KEYS_LOCAL_STORAGE);
    if (keys) {
      try {
        const { masterKey, publicKey } = JSON.parse(keys);

        if (publicKey === payloadPublicKey) {
          // Master is already present
          return masterKey;
        } else {
          // the user is a different. We need a new masterKey for this user as well
          return false;
        }
      } catch {
        return false;
      }
    } else {
      return false;
    }
  },
  clear: async () => {
    await Promise.all([
      storageService.clear(),
      db.notes.clear(),
      db.syncQueue.clear(),
    ]);
  },
  store: async (payload: {
    publicKey: string;
    privateKey: string;
    accessToken: string;
    masterKey?: string;
  }) => {
    const { accessToken, privateKey, publicKey, masterKey } = payload;

    // we will check if we have master key
    // if we have master key then decrypt the private key
    if (masterKey) {
      const decryptedPrivateKey = await cryptoService.decryptPrivateKey(
        privateKey,
        masterKey,
      );
      await Promise.all([
        storageService.put(STORAGE_KEYS.PUBLIC_KEY, publicKey),
        storageService.put(STORAGE_KEYS.JWT_KEY, accessToken),
        storageService.put(STORAGE_KEYS.PRIVATE_KEY, decryptedPrivateKey),
        storageService.put(STORAGE_KEYS.MASTER_KEY, masterKey),
      ]);
      removeTempStorage();
    } else {
      await Promise.all([
        storageService.put(STORAGE_KEYS.PUBLIC_KEY, publicKey),
        storageService.put(STORAGE_KEYS.JWT_KEY, accessToken),
        storageService.put(STORAGE_KEYS.PRIVATE_KEY, privateKey),
      ]);
    }
  },
  storeMasterKey: async (payload: { masterKey: string }) => {
    const { masterKey } = payload;
    const encryptedPrivateKey = await storageService.get<string>(
      STORAGE_KEYS.PRIVATE_KEY,
    );

    if (encryptedPrivateKey) {
      const decryptedPrivateKey = await cryptoService.decryptPrivateKey(
        encryptedPrivateKey,
        masterKey,
      );
      await Promise.all([
        storageService.put(STORAGE_KEYS.PRIVATE_KEY, decryptedPrivateKey),
        storageService.put(STORAGE_KEYS.MASTER_KEY, masterKey),
      ]);
      removeTempStorage();
    } else {
      logService.error("Private key is not present");
    }
  },
};
