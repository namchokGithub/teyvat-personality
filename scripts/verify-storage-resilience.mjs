import { createServer } from "vite";

const server = await createServer({
  root: process.cwd(),
  appType: "custom",
  server: { middlewareMode: true, hmr: false },
  logLevel: "error",
});

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

class FakeStorage {
  #store = new Map();
  #throwOn = new Set();
  setFailing(...methods) {
    this.#throwOn = new Set(methods);
  }
  #maybeThrow(method, name) {
    if (this.#throwOn.has(method)) throw new DOMException(method, name);
  }
  getItem(key) {
    this.#maybeThrow("getItem", "SecurityError");
    return this.#store.has(key) ? this.#store.get(key) : null;
  }
  setItem(key, value) {
    this.#maybeThrow("setItem", "QuotaExceededError");
    this.#store.set(key, String(value));
  }
  removeItem(key) {
    this.#maybeThrow("removeItem", "SecurityError");
    this.#store.delete(key);
  }
}

globalThis.localStorage = new FakeStorage();
globalThis.window = new EventTarget();
window.location = { hostname: "app.example.com" };

try {
  const safeStorage = await server.ssrLoadModule("/src/lib/safe-storage.ts");
  const KEY = "verify-key";

  assert(
    safeStorage.safeGetItem(KEY) === null,
    "Missing key must read as null",
  );
  assert(
    safeStorage.safeSetItem(KEY, "value-1") === true,
    "Write must succeed and report true when storage works",
  );
  assert(
    safeStorage.safeGetItem(KEY) === "value-1",
    "Read must return what was written",
  );
  safeStorage.safeRemoveItem(KEY);
  assert(
    safeStorage.safeGetItem(KEY) === null,
    "Removed key must read as null",
  );
  assert(
    safeStorage.isStorageDegraded() === false,
    "Must not be degraded before any failure",
  );

  let degradedEventFired = false;
  window.addEventListener(safeStorage.STORAGE_DEGRADED_EVENT, () => {
    degradedEventFired = true;
  });
  localStorage.setFailing("setItem");
  const wroteOk = safeStorage.safeSetItem(KEY, "value-2");
  assert(
    wroteOk === false,
    "safeSetItem must return false when the write throws (e.g. quota exceeded)",
  );
  assert(
    degradedEventFired === true,
    "A failed write must fire the storage-degraded event",
  );
  assert(
    safeStorage.isStorageDegraded() === true,
    "isStorageDegraded must become true after a failed write",
  );
  assert(
    safeStorage.safeGetItem(KEY) === "value-2",
    "A failed write must still be readable back from the in-memory fallback",
  );

  localStorage.setFailing("getItem", "setItem");
  assert(
    safeStorage.safeGetItem(KEY) === "value-2",
    "safeGetItem must fall back to memory when the read itself throws",
  );

  localStorage.setFailing("removeItem");
  let removeThrew = false;
  try {
    safeStorage.safeRemoveItem(KEY);
  } catch {
    removeThrew = true;
  }
  assert(
    removeThrew === false,
    "safeRemoveItem must not throw when the underlying removal throws",
  );
  localStorage.setFailing();
  assert(
    safeStorage.safeGetItem(KEY) === null,
    "safeRemoveItem must clear the in-memory fallback even if the underlying removal failed",
  );

  localStorage.setFailing();
  const [quizResult, shareThrottle, quizProgress] = await Promise.all([
    server.ssrLoadModule("/src/utils/quiz-result.ts"),
    server.ssrLoadModule("/src/utils/share-throttle.ts"),
    server.ssrLoadModule("/src/hooks/useQuizProgress.ts"),
  ]);

  localStorage.setItem("teyvat-quiz-result-v1", "{not valid json");
  assert(
    quizResult.readQuizResult() === null,
    "readQuizResult must fail safe to null on corrupt JSON",
  );

  localStorage.setItem("teyvat-share-throttle-v1", "{not valid json");
  assert(
    shareThrottle.canPublishSharedResult() === true,
    "canPublishSharedResult must treat corrupt throttle data as no prior publishes",
  );

  localStorage.setItem("teyvat-quiz-progress-v3", "{not valid json");
  assert(
    quizProgress.hasSavedQuizProgress() === false,
    "hasSavedQuizProgress must fail safe to false on corrupt JSON",
  );

  console.log("Storage resilience verification passed.");
} finally {
  await server.close();
}
