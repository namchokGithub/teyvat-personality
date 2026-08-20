import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { Languages, Sparkles } from "lucide-react";
import { Link, NavLink } from "react-router-dom";

import { t } from "../../i18n";
import type { Locale } from "../../types";

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
          <NavLink to="/quiz">{t(locale, "navQuiz")}</NavLink>
          <NavLink to="/characters">{t(locale, "navCharacters")}</NavLink>
          <NavLink to="/result">{t(locale, "navResult")}</NavLink>
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
      <PageContainer><p>{t(locale, "disclaimer")}</p></PageContainer>
    </footer>
  );
}

export function ElementBadge({ element }: { element: string }) {
  return <span className={`element-badge element-badge--${element.toLowerCase()}`}>{element}</span>;
}
