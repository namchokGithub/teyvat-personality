import { Link } from "react-router-dom";

import { PageContainer } from "../components/common";
import { t } from "../i18n";
import type { Locale } from "../types";

export function NotFoundPage({ locale = "en" }: { locale?: Locale }) {
  return <PageContainer className="not-found"><h1>404</h1><p>{t(locale, "notFoundBody")}</p><Link className="button button--primary" to="/">{t(locale, "returnHome")}</Link></PageContainer>;
}
