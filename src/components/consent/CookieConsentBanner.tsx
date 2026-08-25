import { Cookie } from "lucide-react";

import { Button } from "../common";
import { t } from "../../i18n";
import type { Locale } from "../../types";

export function CookieConsentBanner({
  locale,
  onAcceptAll,
  onNecessaryOnly,
  onOpenSettings,
}: {
  locale: Locale;
  onAcceptAll: () => void;
  onNecessaryOnly: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <div
      className="cookie-banner"
      role="region"
      aria-label={t(locale, "cookieDialogTitle")}
    >
      <div className="cookie-banner__copy">
        <span className="cookie-banner__icon" aria-hidden="true">
          <Cookie size={18} />
        </span>
        <p>{t(locale, "cookieBannerBody")}</p>
      </div>
      <div className="cookie-banner__actions">
        <Button onClick={onAcceptAll}>{t(locale, "cookieAcceptAll")}</Button>
        <Button variant="secondary" onClick={onNecessaryOnly}>
          {t(locale, "cookieNecessaryOnly")}
        </Button>
        <Button variant="ghost" onClick={onOpenSettings}>
          {t(locale, "cookieCustomize")}
        </Button>
      </div>
    </div>
  );
}
