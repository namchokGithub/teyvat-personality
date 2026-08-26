const memoryStore = new Map<string, string>();
export const STORAGE_DEGRADED_EVENT = "teyvat:storage-degraded";
let degraded = false;

export function isStorageDegraded() {
  return degraded;
}

export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return memoryStore.get(key) ?? null;
  }
}

export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    memoryStore.set(key, value);
    if (!degraded) {
      degraded = true;
      window.dispatchEvent(new Event(STORAGE_DEGRADED_EVENT));
    }
    return false;
  }
}

export function safeRemoveItem(key: string): void {
  memoryStore.delete(key);
  try {
    localStorage.removeItem(key);
  } catch {
    // Storage unavailable — memory copy already cleared above.
  }
}
