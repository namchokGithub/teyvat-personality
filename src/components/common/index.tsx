import { useState, type ButtonHTMLAttributes, type PropsWithChildren } from "react";
import { Languages, MapPin, Sparkles } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

import { t } from "../../i18n";
import { beginQuizFromNavigation } from "../../hooks";
import type { Locale } from "../../types";
import anemoIcon from "../../assets/images/elements/anemo.png";
import cryoIcon from "../../assets/images/elements/cryo.png";
import dendroIcon from "../../assets/images/elements/dendro.png";
import electroIcon from "../../assets/images/elements/electro.png";
import geoIcon from "../../assets/images/elements/geo.png";
import hydroIcon from "../../assets/images/elements/hydro.png";
import pyroIcon from "../../assets/images/elements/pyro.png";

export { RouteFocus } from "./RouteFocus";

export function PageContainer({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return <div className={`page-container ${className}`}>{children}</div>;
}

export function ContentCard({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return <section className={`content-card ${className}`}>{children}</section>;
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" };

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return <button type="button" className={`button button--${variant} ${className}`} {...props} />;
}

export function AppHeader({ locale, onToggleLocale }: { locale: Locale; onToggleLocale: () => void }) {
  return (
    <header className="app-header">
      <PageContainer className="app-header__inner">
        <Link className="brand" to="/" aria-label={t(locale, "brand")}>
          <span className="brand__mark"><Sparkles size={17} /></span>
          <span>{t(locale, "brand")}</span>
        </Link>
        <nav className="app-nav" aria-label="Primary navigation">
          <NavLink to="/quiz" onClick={beginQuizFromNavigation}>{t(locale, "navQuiz")}</NavLink>
          <NavLink to="/characters">{t(locale, "navCharacters")}</NavLink>
          <Button variant="ghost" onClick={onToggleLocale} aria-label="Change language">
            <Languages size={16} /> {t(locale, "language")}
          </Button>
        </nav>
      </PageContainer>
    </header>
  );
}

export function AppFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="app-footer">
      <PageContainer>
        <p>{t(locale, "disclaimer")} · By Lesser Lord Kusanali © 2026</p>
      </PageContainer>
    </footer>
  );
}

export function ElementBadge({ element }: { element: string }) {
  return <span className={`element-badge element-badge--${element.toLowerCase()}`}><ElementIcon element={element} />{element}</span>;
}

const elementIcons: Record<string, string> = { anemo: anemoIcon, cryo: cryoIcon, dendro: dendroIcon, electro: electroIcon, geo: geoIcon, hydro: hydroIcon, pyro: pyroIcon };

export function ElementIcon({ element, alt = "", className = "" }: { element: string; alt?: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const source = elementIcons[element.toLowerCase()];
  if (!source || failed) return <span className={`element-icon element-icon--fallback ${className}`} role={alt ? "img" : undefined} aria-label={alt || undefined}><Sparkles aria-hidden="true" /></span>;
  return <img className={`element-icon ${className}`} src={source} alt={alt} onError={() => setFailed(true)} />;
}

export function RegionBadge({ region }: { region: string }) {
  return <span className="region-badge"><MapPin size={13} aria-hidden="true" />{region}</span>;
}
