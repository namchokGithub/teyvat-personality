import { BookOpen, Download, RotateCcw, Sparkles } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button, ContentCard, PageContainer } from "../components/common";
import { CharacterResultCard, VisionCard } from "../components/result";
import { useQuizProgress } from "../hooks";
import { t } from "../i18n";
import type { Locale } from "../types";
import { downloadShareCard } from "../utils/share-result";
import { readQuizResult } from "../utils/quiz-result";

export function ResultPage({ locale }: { locale: Locale }) {
  const navigate = useNavigate();
  const { reset } = useQuizProgress();
  const [result] = useState(() => readQuizResult());
  const [downloadError, setDownloadError] = useState(false);
  const character = result?.characterMatches[0];
  const vision = result?.visionMatches[0];
  if (!character || !vision) return <InvalidResult locale={locale} />;

  const downloadCard = async () => {
    try { await downloadShareCard(character, vision, locale); setDownloadError(false); } catch { setDownloadError(true); }
  };

  return <main className="result-page"><PageContainer className="result-shell">
    <div className="result-heading"><span className="eyebrow"><Sparkles size={15} />{t(locale, "resultEyebrow")}</span></div>
    <CharacterResultCard character={character} locale={locale} />
    <div className="result-details"><ContentCard><span className="section-kicker">{t(locale, "sharedTraits")}</span><div className="trait-list">{character.matchingTraits.map((trait) => <span key={trait.en}>{trait[locale]}</span>)}</div></ContentCard><VisionCard vision={vision} locale={locale} title={t(locale, "visionTitle")} /></div>
    <div className="result-actions"><Button onClick={() => void downloadCard()}><Download size={18} />{t(locale, "downloadCard")}</Button><Link className="button button--secondary" to={`/characters/${character.characterId}`}><BookOpen size={18} />{t(locale, "characterDetails")}</Link><Button variant="secondary" onClick={() => { reset(); navigate("/", { state: { requestName: true } }); }}><RotateCcw size={18} />{t(locale, "tryAgain")}</Button></div>
    {downloadError && <p className="result-action-error" role="status">Unable to download the card. Please try again.</p>}
  </PageContainer></main>;
}

function InvalidResult({ locale }: { locale: Locale }) {
  return <main className="result-page"><PageContainer className="result-shell"><div className="empty-state"><span className="empty-state__icon">!</span><h1>{t(locale, "invalidResult")}</h1><p>{t(locale, "invalidResultBody")}</p><Link className="button button--primary" to="/quiz">{t(locale, "start")}</Link></div></PageContainer></main>;
}
