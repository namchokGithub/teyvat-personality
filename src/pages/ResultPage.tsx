import { BookOpen, RotateCcw, Share2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button, ContentCard, PageContainer } from "../components/common";
import { CharacterResultCard, VisionCard } from "../components/result";
import { ShareResultDialog } from "../components/share";
import { mockCharacter, mockVision } from "../data/mock-ui";
import { useQuizProgress } from "../hooks";
import { t } from "../i18n";
import type { Locale } from "../types";
import { validateSharedResult } from "../utils/share-result";

export function ResultPage({ locale }: { locale: Locale }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { reset } = useQuizProgress();
  const [showShare, setShowShare] = useState(false);
  const sharedState = validateSharedResult(location.search, mockCharacter, mockVision);
  if (sharedState === "invalid") return <main className="result-page"><PageContainer className="result-shell"><div className="empty-state"><span className="empty-state__icon">!</span><h1>{t(locale, "invalidResult")}</h1><p>{t(locale, "invalidResultBody")}</p><Link className="button button--primary" to="/result">{t(locale, "viewPreview")}</Link></div></PageContainer></main>;
  return <main className="result-page"><PageContainer className="result-shell">{sharedState === "shared" && <div className="shared-result-notice" role="status">{t(locale, "sharedResultNotice")}</div>}<div className="result-heading"><span className="eyebrow"><Sparkles size={15} />{t(locale, "resultEyebrow")}</span></div><CharacterResultCard character={mockCharacter} locale={locale} /><div className="result-details"><ContentCard><span className="section-kicker">{t(locale, "sharedTraits")}</span><div className="trait-list">{mockCharacter.matchingTraits.map((trait) => <span key={trait.en}>{trait[locale]}</span>)}</div></ContentCard><VisionCard vision={mockVision} locale={locale} title={t(locale, "visionTitle")} /></div><p className="mock-notice">{t(locale, "mockNotice")}</p><div className="result-actions"><Button onClick={() => setShowShare(true)}><Share2 size={18} />{t(locale, "share")}</Button><Link className="button button--secondary" to={`/characters/${mockCharacter.characterId}`}><BookOpen size={18} />{t(locale, "characterDetails")}</Link><Button variant="secondary" onClick={() => { reset(); navigate("/quiz"); }}><RotateCcw size={18} />{t(locale, "tryAgain")}</Button></div></PageContainer>{showShare && <ShareResultDialog character={mockCharacter} vision={mockVision} locale={locale} onClose={() => setShowShare(false)} />}</main>;
}
