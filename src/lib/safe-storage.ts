const memoryStore = new Map<string, string>();
export const STORAGE_DEGRADED_EVENT = "teyvat:storage-degraded";
let degraded = false;

export function isStorageDegraded() {
  return degraded;
}

function markDegraded() {
  if (degraded) return;
  degraded = true;
  window.dispatchEvent(new Event(STORAGE_DEGRADED_EVENT));
}

export function safeGetItem(key: string): string | null {
  if (memoryStore.has(key)) return memoryStore.get(key)!;
  try {
    return localStorage.getItem(key);
  } catch {
    markDegraded();
    return null;
  }
}

export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    memoryStore.set(key, value);
    markDegraded();
    return false;
  }
}

export function safeRemoveItem(key: string): void {
  memoryStore.delete(key);
  try {
    localStorage.removeItem(key);
  } catch {
    markDegraded();
  }
}
