import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Route, Routes } from "react-router-dom";

import { AppFooter, AppHeader, RouteFocus } from "./components/common";
import { CookieConsentBanner, CookiePreferencesDialog } from "./components/consent";
import { t } from "./i18n";
import { hasDecided, setConsent } from "./lib/consent";
import { CharacterPage, CharactersPage, LandingPage, MatchingPage, NotFoundPage, QuizPage, ResultPage } from "./pages";
import type { Locale, Theme } from "./types";

const THEME_STORAGE_KEY = "teyvat-theme";
const SharedResultPage = lazy(async () => {
  const module = await import("./pages/SharedResultPage");
  return { default: module.SharedResultPage };
});

function readStoredTheme(): Theme | null {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  return saved === "light" || saved === "dark" ? saved : null;
}

function readInitialTheme(): Theme {
  return readStoredTheme() ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
}

export function App() {
  const [locale, setLocale] = useState<Locale>(() => localStorage.getItem("teyvat-locale") === "en" ? "en" : "th");
  const [theme, setTheme] = useState<Theme>(readInitialTheme);
  const hasExplicitTheme = useRef(readStoredTheme() !== null);
  const [cookieDialogOpen, setCookieDialogOpen] = useState(false);
  const [cookieConsentDecided, setCookieConsentDecided] = useState(() => hasDecided());

  useEffect(() => {
    localStorage.setItem("teyvat-locale", locale);
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      if (hasExplicitTheme.current) return;
      setTheme(event.matches ? "dark" : "light");
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    hasExplicitTheme.current = true;
    setTheme((value) => {
      const next: Theme = value === "light" ? "dark" : "light";
      localStorage.setItem(THEME_STORAGE_KEY, next);
      return next;
    });
  };

  return (
    <div className={`app-shell${cookieConsentDecided ? "" : " app-shell--consent-pending"}`}>
      <a className="skip-link" href="#main-content">{t(locale, "skipContent")}</a>
      <AppHeader
        locale={locale}
        onToggleLocale={() => setLocale((value) => value === "th" ? "en" : "th")}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      <RouteFocus />
      <div id="main-content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<LandingPage locale={locale} />} />
          <Route path="/quiz" element={<QuizPage locale={locale} />} />
          <Route path="/matching" element={<MatchingPage locale={locale} />} />
          <Route path="/result" element={<ResultPage locale={locale} />} />
          <Route
            path="/shared/:id"
            element={
              <Suspense fallback={null}>
                <SharedResultPage locale={locale} />
              </Suspense>
            }
          />
          <Route path="/characters" element={<CharactersPage locale={locale} />} />
          <Route path="/characters/:slug" element={<CharacterPage locale={locale} />} />
          <Route path="*" element={<NotFoundPage locale={locale} />} />
        </Routes>
      </div>
      {!cookieConsentDecided && (
        <CookieConsentBanner
          locale={locale}
          onAcceptAll={() => {
            setConsent(true);
            setCookieConsentDecided(true);
          }}
          onNecessaryOnly={() => {
            setConsent(false);
            setCookieConsentDecided(true);
          }}
          onOpenSettings={() => setCookieDialogOpen(true)}
        />
      )}
      <CookiePreferencesDialog
        locale={locale}
        open={cookieDialogOpen}
        onClose={() => setCookieDialogOpen(false)}
        onSave={(analytics) => {
          setConsent(analytics);
          setCookieConsentDecided(true);
        }}
      />
      <AppFooter locale={locale} onOpenCookieSettings={() => setCookieDialogOpen(true)} />
    </div>
  );
}
