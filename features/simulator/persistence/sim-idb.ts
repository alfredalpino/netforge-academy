/** IndexedDB persistence for simulator labs — separate from academy progress. */

const DB_NAME = "netforge-sim";
const DB_VERSION = 1;
const STORE = "workspaces";

export type SimWorkspaceRecord = {
  id: string;
  labId: string | null;
  title: string;
  updatedAt: number;
  snapshotJson: string;
  positionsJson: string;
  attemptsJson: string;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error("IDB open failed"));
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
  });
}

export async function saveWorkspace(record: SimWorkspaceRecord): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IDB write failed"));
    tx.objectStore(STORE).put(record);
  });
  db.close();
}

export async function loadWorkspace(
  id: string,
): Promise<SimWorkspaceRecord | null> {
  const db = await openDb();
  const record = await new Promise<SimWorkspaceRecord | null>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve((req.result as SimWorkspaceRecord) ?? null);
    req.onerror = () => reject(req.error ?? new Error("IDB read failed"));
  });
  db.close();
  return record;
}

export async function listWorkspaces(): Promise<SimWorkspaceRecord[]> {
  const db = await openDb();
  const rows = await new Promise<SimWorkspaceRecord[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve((req.result as SimWorkspaceRecord[]) ?? []);
    req.onerror = () => reject(req.error ?? new Error("IDB list failed"));
  });
  db.close();
  return rows.sort((a, b) => b.updatedAt - a.updatedAt);
}
