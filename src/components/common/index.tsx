import {
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type PropsWithChildren,
} from "react";
import { ArrowUp, Languages, MapPin, Sparkles } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

import { t } from "../../i18n";
import { beginQuizFromNavigation } from "../../hooks";
import type { Locale, Theme } from "../../types";
import anemoIcon from "../../assets/images/elements/anemo.png";
import characterLogo from "../../assets/images/characters.png";
import cryoIcon from "../../assets/images/elements/cryo.png";
import dayIcon from "../../assets/images/day.png";
import dendroIcon from "../../assets/images/elements/dendro.png";
import electroIcon from "../../assets/images/elements/electro.png";
import geoIcon from "../../assets/images/elements/geo.png";
import hydroIcon from "../../assets/images/elements/hydro.png";
import nightIcon from "../../assets/images/night.png";
import pyroIcon from "../../assets/images/elements/pyro.png";
import fontaineRegionIcon from "../../assets/images/Fontaine.png";
import inazumaRegionIcon from "../../assets/images/Inazuma.png";
import liyueRegionIcon from "../../assets/images/Liyue.png";
import mondstadtRegionIcon from "../../assets/images/Mondstadt.png";
import natlanRegionIcon from "../../assets/images/Natlan.png";
import nodKraiRegionIcon from "../../assets/images/Nod-Krai.png";
import snezhnayaRegionIcon from "../../assets/images/Snezhnaya.png";
import sumeruRegionIcon from "../../assets/images/Sumeru.png";

export { RouteFocus } from "./RouteFocus";

export function PageContainer({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return <div className={`page-container ${className}`}>{children}</div>;
}

export function ContentCard({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return <section className={`content-card ${className}`}>{children}</section>;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      className={`button button--${variant} ${className}`}
      {...props}
    />
  );
}

export function BackToTopButton({ locale }: { locale: Locale }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setIsVisible(window.scrollY > 360);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      className="back-to-top"
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label={t(locale, "backToTop")}
      title={t(locale, "backToTop")}
    >
      <ArrowUp size={20} aria-hidden="true" />
    </button>
  );
}

export function AppHeader({
  locale,
  onToggleLocale,
  theme,
  onToggleTheme,
}: {
  locale: Locale;
  onToggleLocale: () => void;
  theme: Theme;
  onToggleTheme: () => void;
}) {
  return (
    <header className="app-header">
      <PageContainer className="app-header__inner">
        <Link className="brand" to="/" aria-label="Teyvat Personalities">
          <span className="brand__mark">
            <img src={characterLogo} alt="" />
          </span>
          <span className="brand__name">Teyvat Personalities</span>
        </Link>
        <nav className="app-nav" aria-label="Primary navigation">
          <NavLink to="/quiz" onClick={beginQuizFromNavigation}>
            {t(locale, "navQuiz")}
          </NavLink>
          <NavLink to="/characters">{t(locale, "navCharacters")}</NavLink>
          <Button
            variant="ghost"
            className="theme-toggle"
            onClick={onToggleTheme}
            aria-label={t(
              locale,
              theme === "dark" ? "themeDark" : "themeLight",
            )}
            title={t(locale, theme === "dark" ? "themeDark" : "themeLight")}
          >
            <img
              className="theme-toggle__icon"
              src={theme === "dark" ? nightIcon : dayIcon}
              alt=""
            />
          </Button>
          <Button
            variant="ghost"
            onClick={onToggleLocale}
            aria-label="Change language"
          >
            <Languages size={16} /> {t(locale, "language")}
          </Button>
        </nav>
      </PageContainer>
    </header>
  );
}

export function AppFooter({
  locale,
  onOpenCookieSettings,
}: {
  locale: Locale;
  onOpenCookieSettings: () => void;
}) {
  return (
    <footer className="app-footer">
      <PageContainer>
        <p>{t(locale, "disclaimer")} · By Lesser Lord Kusanali © 2026</p>
        <button
          type="button"
          className="text-button"
          onClick={onOpenCookieSettings}
        >
          {t(locale, "cookieSettingsLink")}
        </button>
      </PageContainer>
    </footer>
  );
}

export function ElementBadge({ element }: { element: string }) {
  return (
    <span className={`element-badge element-badge--${element.toLowerCase()}`}>
      <ElementIcon element={element} />
      {element}
    </span>
  );
}

const elementIcons: Record<string, string> = {
  anemo: anemoIcon,
  cryo: cryoIcon,
  dendro: dendroIcon,
  electro: electroIcon,
  geo: geoIcon,
  hydro: hydroIcon,
  pyro: pyroIcon,
};

export function ElementIcon({
  element,
  alt = "",
  className = "",
}: {
  element: string;
  alt?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const source = elementIcons[element.toLowerCase()];
  if (!source || failed)
    return (
      <span
        className={`element-icon element-icon--fallback ${className}`}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
      >
        <Sparkles aria-hidden="true" />
      </span>
    );
  return (
    <img
      className={`element-icon ${className}`}
      src={source}
      alt={alt}
      onError={() => setFailed(true)}
    />
  );
}

export function RegionBadge({ region }: { region: string }) {
  const regionKey = region.toLowerCase().replaceAll(" ", "-");
  const icon = regionIcons[regionKey];
  return (
    <span className={`region-badge region-badge--${regionKey}`}>
      {icon ? (
        <img className="region-badge__icon" src={icon} alt="" />
      ) : (
        <MapPin size={13} aria-hidden="true" />
      )}
      {region}
    </span>
  );
}

const regionIcons: Record<string, string> = {
  fontaine: fontaineRegionIcon,
  inazuma: inazumaRegionIcon,
  liyue: liyueRegionIcon,
  mondstadt: mondstadtRegionIcon,
  natlan: natlanRegionIcon,
  "nod-krai": nodKraiRegionIcon,
  snezhnaya: snezhnayaRegionIcon,
  sumeru: sumeruRegionIcon,
};
