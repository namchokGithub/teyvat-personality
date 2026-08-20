import { Sparkles } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { t } from "../i18n";
import type { Locale } from "../types";

export function MatchingPage({ locale }: { locale: Locale }) {
  const navigate = useNavigate();
  useEffect(() => { const timer = window.setTimeout(() => navigate("/result", { replace: true }), 1600); return () => window.clearTimeout(timer); }, [navigate]);
  return <main className="matching-page"><div className="matching-state" role="status"><span className="matching-state__rings"><Sparkles size={36} /></span><h1>{t(locale, "matchingTitle")}</h1><p>{t(locale, "matchingBody")}</p><span className="matching-state__bar" /></div></main>;
}
