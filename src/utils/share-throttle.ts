const STORAGE_KEY = "teyvat-share-throttle-v1";
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PUBLISHES_PER_WINDOW = 5;

function isLocalhost() {
  return ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
}

function readTimestamps(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value)
      ? value.filter((entry): entry is number => typeof entry === "number")
      : [];
  } catch {
    return [];
  }
}

function pruneTimestamps(timestamps: number[], now: number): number[] {
  return timestamps.filter((timestamp) => now - timestamp < WINDOW_MS);
}

export function canPublishSharedResult(now = Date.now()): boolean {
  if (isLocalhost()) return true;
  return (
    pruneTimestamps(readTimestamps(), now).length < MAX_PUBLISHES_PER_WINDOW
  );
}

export function recordSharedResultPublish(now = Date.now()) {
  if (isLocalhost()) return;
  const timestamps = pruneTimestamps(readTimestamps(), now);
  timestamps.push(now);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(timestamps));
}
