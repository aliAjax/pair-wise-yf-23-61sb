const DB_NAME = "stage-light";
const DB_VERSION = 1;
const STORE_NAMES = ["fixture", "cueScene", "timelineTrack", "showProject"] as const;
export type StoreName = (typeof STORE_NAMES)[number];

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        for (const name of STORE_NAMES) {
          if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  return dbPromise;
}

function run<T>(store: StoreName, mode: IDBTransactionMode, action: (objectStore: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const request = action(db.transaction(store, mode).objectStore(store));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      })
  );
}

export const idbGetAll = <T>(store: StoreName): Promise<T[]> => run(store, "readonly", (s) => s.getAll() as IDBRequest<T[]>);
export const idbPut = <T>(store: StoreName, row: T): Promise<IDBValidKey> => run(store, "readwrite", (s) => s.put(row));
export const idbDelete = (store: StoreName, id: number): Promise<undefined> => run(store, "readwrite", (s) => s.delete(id));

// 首次打开时把本地 mock 种子写入 IndexedDB，之后一切以库内数据为准。
export async function idbGetAllSeeded<T>(store: StoreName, seed: readonly T[]): Promise<T[]> {
  if (typeof indexedDB === "undefined") return [...seed];
  const rows = await idbGetAll<T>(store);
  if (rows.length > 0) return rows;
  for (const row of seed) await idbPut(store, row);
  return [...seed];
}
