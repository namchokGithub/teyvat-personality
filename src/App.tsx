import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";

import { AppFooter, AppHeader, RouteFocus } from "./components/common";
import { t } from "./i18n";
import { CharacterPage, CharactersPage, LandingPage, MatchingPage, NotFoundPage, QuizPage, ResultPage } from "./pages";
import type { Locale } from "./types";

export function App() {
  const [locale, setLocale] = useState<Locale>(() => localStorage.getItem("teyvat-locale") === "en" ? "en" : "th");

  useEffect(() => {
    localStorage.setItem("teyvat-locale", locale);
    document.documentElement.lang = locale;
  }, [locale]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">{t(locale, "skipContent")}</a>
      <AppHeader locale={locale} onToggleLocale={() => setLocale((value) => value === "th" ? "en" : "th")} />
      <RouteFocus />
      <div id="main-content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<LandingPage locale={locale} />} />
          <Route path="/quiz" element={<QuizPage locale={locale} />} />
          <Route path="/matching" element={<MatchingPage locale={locale} />} />
          <Route path="/result" element={<ResultPage locale={locale} />} />
          <Route path="/characters" element={<CharactersPage locale={locale} />} />
          <Route path="/characters/:slug" element={<CharacterPage locale={locale} />} />
          <Route path="*" element={<NotFoundPage locale={locale} />} />
        </Routes>
      </div>
      <AppFooter />
    </div>
  );
}
