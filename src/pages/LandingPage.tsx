import { ArrowRight, Compass, Sparkles, WandSparkles } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import { ContentCard, PageContainer } from "../components/common";
import { hasSavedQuizProgress } from "../hooks";
import { t } from "../i18n";
import type { Locale } from "../types";

export function LandingPage({ locale }: { locale: Locale }) {
  const [canResume] = useState(hasSavedQuizProgress);
  const features = [
    [Sparkles, "featureCharacter", "featureCharacterBody"],
    [Compass, "featureVision", "featureVisionBody"],
    [WandSparkles, "featureShare", "featureShareBody"],
  ] as const;
  return <main><PageContainer className="hero"><div className="hero__copy"><span className="eyebrow"><Sparkles size={15} />{t(locale, "eyebrow")}</span><h1>{t(locale, "heroTitle")}</h1><p>{t(locale, "heroBody")}</p><div className="hero__actions"><Link className="button button--primary" to="/quiz">{t(locale, canResume ? "resume" : "start")}<ArrowRight size={18} /></Link><Link className="button button--secondary" to="/result">{t(locale, "preview")}</Link></div><span className="hero__meta">{t(locale, "meta")}</span></div><div className="hero-art" aria-hidden="true"><span className="hero-art__orb hero-art__orb--one" /><span className="hero-art__orb hero-art__orb--two" /><div className="hero-art__card"><Sparkles size={54} /><strong>Who echoes<br />your story?</strong><small>Character · Vision · Traits</small></div></div></PageContainer><PageContainer className="feature-grid">{features.map(([Icon, title, body]) => <ContentCard key={title} className="feature-card"><span className="feature-card__icon"><Icon size={22} /></span><h2>{t(locale, title)}</h2><p>{t(locale, body)}</p></ContentCard>)}</PageContainer></main>;
}
