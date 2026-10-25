export interface CapturedMedia {
  id: string;
  ownerId: string;
  type: 'photo' | 'video';
  name: string;
  mimeType: string;
  createdAt: string;
  blob: Blob;
}

const DATABASE_NAME = 'nirbhaya-local-captures';
const STORE_NAME = 'captures';

function openDatabase(): Promise<IDBDatabase> {
  if (!('indexedDB' in globalThis)) {
    return Promise.reject(new Error('Local media storage is unavailable in this browser.'));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Could not open local media storage.'));
  });
}

async function withStore<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const request = operation(transaction.objectStore(STORE_NAME));
    let result: T;
    request.onsuccess = () => { result = request.result; };
    request.onerror = () => reject(new Error('Could not access saved media.'));
    transaction.oncomplete = () => {
      database.close();
      resolve(result);
    };
    transaction.onerror = () => {
      database.close();
      reject(new Error('Could not save changes to local media storage.'));
    };
  });
}

export const captureStorageService = {
  async list(ownerId: string): Promise<CapturedMedia[]> {
    const items = await withStore<CapturedMedia[]>('readonly', store => store.getAll());
    return items.filter(item => item.ownerId === ownerId)
      .sort((first, second) => second.createdAt.localeCompare(first.createdAt));
  },

  async save(item: CapturedMedia): Promise<void> {
    await withStore<IDBValidKey>('readwrite', store => store.put(item));
  },

  async delete(id: string): Promise<void> {
    await withStore<undefined>('readwrite', store => store.delete(id));
  },

  async clear(ownerId: string): Promise<void> {
    const items = await this.list(ownerId);
    const database = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      items.forEach(item => store.delete(item.id));
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(new Error('Could not clear local captures.'));
      transaction.onabort = () => reject(new Error('Could not clear local captures.'));
    }).finally(() => database.close());
  }
};