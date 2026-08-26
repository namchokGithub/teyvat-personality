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
  getItem(key) {
    return this.#store.has(key) ? this.#store.get(key) : null;
  }
  setItem(key, value) {
    this.#store.set(key, String(value));
  }
  removeItem(key) {
    this.#store.delete(key);
  }
}

globalThis.localStorage = new FakeStorage();
globalThis.window = new EventTarget();

try {
  const consent = await server.ssrLoadModule("/src/lib/consent.ts");

  assert(
    consent.hasDecided() === false,
    "hasDecided must be false with empty storage",
  );
  assert(
    consent.hasAnalyticsConsent() === false,
    "hasAnalyticsConsent must default to false",
  );
  assert(
    consent.getConsent() === null,
    "getConsent must be null with empty storage",
  );

  consent.setConsent(true);
  assert(
    consent.hasDecided() === true,
    "hasDecided must be true after setConsent",
  );
  assert(
    consent.hasAnalyticsConsent() === true,
    "hasAnalyticsConsent must reflect true after setConsent(true)",
  );
  const stored = consent.getConsent();
  assert(
    stored !== null &&
      stored.version === 1 &&
      stored.analytics === true &&
      typeof stored.decidedAt === "string",
    "getConsent must return the stored shape",
  );

  consent.setConsent(false);
  assert(
    consent.hasAnalyticsConsent() === false,
    "hasAnalyticsConsent must reflect false after setConsent(false)",
  );

  localStorage.setItem("teyvat-cookie-consent-v1", "{not valid json");
  assert(
    consent.getConsent() === null,
    "getConsent must fail safe to null on corrupt JSON",
  );
  assert(
    consent.hasAnalyticsConsent() === false,
    "hasAnalyticsConsent must fail safe to false on corrupt JSON",
  );

  localStorage.setItem(
    "teyvat-cookie-consent-v1",
    JSON.stringify({ version: 2, analytics: true, decidedAt: "x" }),
  );
  assert(
    consent.getConsent() === null,
    "getConsent must reject an unknown schema version",
  );
  assert(
    consent.hasDecided() === false,
    "hasDecided must be false for an unknown schema version",
  );

  const originalSetItem = localStorage.setItem.bind(localStorage);
  localStorage.setItem = () => {
    throw new Error("quota exceeded");
  };
  let threwOnFailedWrite = false;
  try {
    consent.setConsent(true);
  } catch {
    threwOnFailedWrite = true;
  }
  assert(
    threwOnFailedWrite === false,
    "setConsent must not throw when the underlying storage write fails",
  );
  localStorage.setItem = originalSetItem;

  console.log("Cookie consent verification passed.");
} finally {
  await server.close();
}
