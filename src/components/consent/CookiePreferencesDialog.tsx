import { X } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "../common";
import { useDialogAccessibility } from "../../hooks";
import { t } from "../../i18n";
import { getConsent } from "../../lib/consent";
import type { Locale } from "../../types";

export function CookiePreferencesDialog({
  locale,
  open,
  onClose,
  onSave,
}: {
  locale: Locale;
  open: boolean;
  onClose: () => void;
  onSave: (analytics: boolean) => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useDialogAccessibility(dialogRef, onClose, open);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setAnalyticsEnabled(getConsent()?.analytics ?? false);
  }

  if (!open) return null;

  const save = () => {
    onSave(analyticsEnabled);
    onClose();
  };

  return (
    <div className="dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        ref={dialogRef}
        className="dialog cookie-preferences-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-dialog-title"
        aria-describedby="cookie-dialog-body"
        tabIndex={-1}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button
          className="dialog__close"
          type="button"
          onClick={onClose}
          aria-label={t(locale, "close")}
        >
          <X size={18} aria-hidden="true" />
        </button>
        <h2 id="cookie-dialog-title">{t(locale, "cookieDialogTitle")}</h2>
        <p id="cookie-dialog-body">{t(locale, "cookieDialogBody")}</p>
        <div className="cookie-preferences__row">
          <div>
            <strong>{t(locale, "cookieNecessaryLabel")}</strong>
            <p>{t(locale, "cookieNecessaryDesc")}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked="true"
            disabled
            className="cookie-toggle cookie-toggle--on"
            aria-label={t(locale, "cookieNecessaryLabel")}
          >
            <span className="cookie-toggle__thumb" />
          </button>
        </div>
        <div className="cookie-preferences__row">
          <div>
            <strong>{t(locale, "cookieAnalyticsLabel")}</strong>
            <p>{t(locale, "cookieAnalyticsDesc")}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={analyticsEnabled}
            className={`cookie-toggle ${analyticsEnabled ? "cookie-toggle--on" : ""}`}
            aria-label={t(locale, "cookieAnalyticsLabel")}
            onClick={() => setAnalyticsEnabled((value) => !value)}
          >
            <span className="cookie-toggle__thumb" />
          </button>
        </div>
        <Button onClick={save}>{t(locale, "cookieSave")}</Button>
      </div>
    </div>
  );
}
