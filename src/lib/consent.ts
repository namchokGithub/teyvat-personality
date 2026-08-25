const STORAGE_KEY = "teyvat-cookie-consent-v1";

interface CookieConsent {
  version: 1;
  analytics: boolean;
  decidedAt: string;
}

export function getConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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
  try {
    const value: CookieConsent = { version: 1, analytics, decidedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage unavailable (private browsing, quota) — fail silently, hasDecided() stays false.
  }
}
