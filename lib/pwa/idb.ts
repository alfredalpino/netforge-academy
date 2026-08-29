const DB_NAME = "netforge-pwa";
const DB_VERSION = 1;

export const STORES = {
  progress: "progress",
  syncQueue: "sync-queue",
  meta: "meta",
} as const;

type StoreName = (typeof STORES)[keyof typeof STORES];

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORES.progress)) {
        db.createObjectStore(STORES.progress);
      }
      if (!db.objectStoreNames.contains(STORES.syncQueue)) {
        db.createObjectStore(STORES.syncQueue, { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORES.meta)) {
        db.createObjectStore(STORES.meta);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
  });
}

function withStore<T>(
  storeName: StoreName,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => Promise<T> | T
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(storeName, mode);
        const store = tx.objectStore(storeName);

        Promise.resolve(operation(store))
          .then((value) => {
            tx.oncomplete = () => resolve(value);
            tx.onerror = () => reject(tx.error ?? new Error("IndexedDB transaction failed"));
            tx.onabort = () => reject(tx.error ?? new Error("IndexedDB transaction aborted"));
          })
          .catch(reject);
      })
  );
}

export async function idbGet<T>(storeName: StoreName, key: IDBValidKey): Promise<T | undefined> {
  return withStore(storeName, "readonly", (store) =>
    new Promise<T | undefined>((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result as T | undefined);
      request.onerror = () => reject(request.error ?? new Error("IndexedDB get failed"));
    })
  );
}

export async function idbSet(storeName: StoreName, key: IDBValidKey, value: unknown): Promise<void> {
  await withStore(storeName, "readwrite", (store) =>
    new Promise<void>((resolve, reject) => {
      const request = store.put(value, key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error ?? new Error("IndexedDB put failed"));
    })
  );
}

export async function idbDelete(storeName: StoreName, key: IDBValidKey): Promise<void> {
  await withStore(storeName, "readwrite", (store) =>
    new Promise<void>((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error ?? new Error("IndexedDB delete failed"));
    })
  );
}

export async function idbGetAll<T>(storeName: StoreName): Promise<T[]> {
  return withStore(storeName, "readonly", (store) =>
    new Promise<T[]>((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as T[]);
      request.onerror = () => reject(request.error ?? new Error("IndexedDB getAll failed"));
    })
  );
}

export async function idbAdd<T extends object>(storeName: StoreName, value: T): Promise<number> {
  return withStore(storeName, "readwrite", (store) =>
    new Promise<number>((resolve, reject) => {
      const request = store.add(value);
      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error ?? new Error("IndexedDB add failed"));
    })
  );
}

export async function idbClear(storeName: StoreName): Promise<void> {
  await withStore(storeName, "readwrite", (store) =>
    new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error ?? new Error("IndexedDB clear failed"));
    })
  );
}

export function isIndexedDbAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}
