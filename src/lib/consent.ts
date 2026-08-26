import { safeGetItem, safeSetItem } from "./safe-storage";

const STORAGE_KEY = "teyvat-cookie-consent-v1";

interface CookieConsent {
  version: 1;
  analytics: boolean;
  decidedAt: string;
}

export function getConsent(): CookieConsent | null {
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (
      typeof value !== "object" ||
      value === null ||
      (value as { version?: unknown }).version !== 1 ||
      typeof (value as { analytics?: unknown }).analytics !== "boolean" ||
      typeof (value as { decidedAt?: unknown }).decidedAt !== "string"
    ) {
      return null;
    }
    return value as CookieConsent;
  } catch {
    return null;
  }
}

export function hasDecided(): boolean {
  return getConsent() !== null;
}

export function hasAnalyticsConsent(): boolean {
  return getConsent()?.analytics ?? false;
}

export function setConsent(analytics: boolean) {
  const value: CookieConsent = {
    version: 1,
    analytics,
    decidedAt: new Date().toISOString(),
  };
  safeSetItem(STORAGE_KEY, JSON.stringify(value));
}
