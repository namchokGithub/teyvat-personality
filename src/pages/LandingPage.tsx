import { ArrowRight, Compass, Sparkles, WandSparkles, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, ContentCard, PageContainer } from "../components/common";
import { useDialogAccessibility, hasSavedQuizProgress } from "../hooks";
import { t } from "../i18n";
import type { Locale } from "../types";
import { readPlayerName, savePlayerName } from "../utils/player-profile";

export function LandingPage({ locale }: { locale: Locale }) {
  const navigate = useNavigate();
  const [canResume] = useState(hasSavedQuizProgress);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [name, setName] = useState(readPlayerName);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeNameDialog = useCallback(() => setShowNameDialog(false), []);
  useDialogAccessibility(dialogRef, closeNameDialog, showNameDialog);
  const features = [[Sparkles, "featureCharacter", "featureCharacterBody"], [Compass, "featureVision", "featureVisionBody"], [WandSparkles, "featureShare", "featureShareBody"]] as const;
  const startQuiz = () => { if (canResume) { navigate("/quiz"); return; } setShowNameDialog(true); };
  const confirmName = () => { savePlayerName(name); closeNameDialog(); navigate("/quiz"); };

  return <main><PageContainer className="hero"><div className="hero__copy"><span className="eyebrow"><Sparkles size={15} />{t(locale, "eyebrow")}</span><h1>{t(locale, "heroTitle")}</h1><p>{t(locale, "heroBody")}</p><div className="hero__actions"><Button onClick={startQuiz}>{t(locale, canResume ? "resume" : "start")}<ArrowRight size={18} /></Button></div><span className="hero__meta">{t(locale, "meta")}</span></div><div className="hero-art" aria-hidden="true"><span className="hero-art__orb hero-art__orb--one" /><span className="hero-art__orb hero-art__orb--two" /><div className="hero-art__card"><Sparkles size={54} /><strong>Who echoes<br />your story?</strong><small>Character · Vision · Traits</small></div></div></PageContainer><PageContainer className="feature-grid">{features.map(([Icon, title, body]) => <ContentCard key={title} className="feature-card"><span className="feature-card__icon"><Icon size={22} /></span><h2>{t(locale, title)}</h2><p>{t(locale, body)}</p></ContentCard>)}</PageContainer>{showNameDialog && <div className="dialog-backdrop" role="presentation" onMouseDown={closeNameDialog}><div ref={dialogRef} className="dialog name-dialog" role="dialog" aria-modal="true" aria-labelledby="name-title" tabIndex={-1} onMouseDown={(event) => event.stopPropagation()}><button className="dialog__close" onClick={closeNameDialog} aria-label={t(locale, "cancel")}><X size={18} aria-hidden="true" /></button><span className="section-kicker">Teyvat Personalities</span><h2 id="name-title">{t(locale, "nameTitle")}</h2><p>{t(locale, "nameBody")}</p><label className="name-field"><span>{t(locale, "nameLabel")}</span><input value={name} onChange={(event) => setName(event.target.value)} maxLength={40} autoFocus placeholder={t(locale, "namePlaceholder")} onKeyDown={(event) => { if (event.key === "Enter") confirmName(); }} /></label><div className="dialog__actions"><Button variant="secondary" onClick={closeNameDialog}>{t(locale, "cancel")}</Button><Button onClick={confirmName}>{t(locale, "confirmName")}</Button></div></div></div>}</main>;
}
