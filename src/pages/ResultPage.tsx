import { BookOpen, RotateCcw, Share2, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button, ContentCard, PageContainer } from "../components/common";
import { CharacterResultCard, VisionCard } from "../components/result";
import { ShareResultDialog } from "../components/share";
import { loadSharedQuizResult } from "../data/personality/calculate-result";
import { useQuizProgress } from "../hooks";
import { t } from "../i18n";
import type { Locale, QuizResult } from "../types";
import { parseSharedResult, validateSharedResult } from "../utils/share-result";
import { readQuizResult } from "../utils/quiz-result";

export function ResultPage({ locale }: { locale: Locale }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { reset } = useQuizProgress();
  const [showShare, setShowShare] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(() => readQuizResult());
  const sharedParams = useMemo(() => result ? null : parseSharedResult(location.search), [location.search, result]);
  const [loading, setLoading] = useState(() => !readQuizResult() && Boolean(sharedParams));

  useEffect(() => {
    if (result || !sharedParams) return;
    let active = true;
    void loadSharedQuizResult(sharedParams).then((sharedResult) => {
      if (active) { setResult(sharedResult); setLoading(false); }
    });
    return () => { active = false; };
  }, [result, sharedParams]);

  if (loading) return <main className="result-page"><PageContainer className="result-shell"><div className="empty-state"><span className="matching-state__rings"><Sparkles size={28} /></span><p>{t(locale, "loadingCharacter")}</p></div></PageContainer></main>;

  const character = result?.characterMatches[0];
  const vision = result?.visionMatches[0];
  if (!character || !vision) return <InvalidResult locale={locale} action="quiz" />;
  const sharedState = validateSharedResult(location.search, character, vision);
  if (sharedState === "invalid") return <InvalidResult locale={locale} action="result" />;

  return (
    <main className="result-page">
      <PageContainer className="result-shell">
        {sharedState === "shared" && <div className="shared-result-notice" role="status">{t(locale, "sharedResultNotice")}</div>}
        <div className="result-heading"><span className="eyebrow"><Sparkles size={15} />{t(locale, "resultEyebrow")}</span></div>
        <CharacterResultCard character={character} locale={locale} />
        <div className="result-details">
          <ContentCard>
            <span className="section-kicker">{t(locale, "sharedTraits")}</span>
            <div className="trait-list">{character.matchingTraits.map((trait) => <span key={trait.en}>{trait[locale]}</span>)}</div>
          </ContentCard>
          <VisionCard vision={vision} locale={locale} title={t(locale, "visionTitle")} />
        </div>
        <div className="result-actions">
          <Button onClick={() => setShowShare(true)}><Share2 size={18} />{t(locale, "share")}</Button>
          <Link className="button button--secondary" to={`/characters/${character.characterId}`}><BookOpen size={18} />{t(locale, "characterDetails")}</Link>
          <Button variant="secondary" onClick={() => { reset(); navigate("/quiz"); }}><RotateCcw size={18} />{t(locale, "tryAgain")}</Button>
        </div>
      </PageContainer>
      {showShare && <ShareResultDialog character={character} vision={vision} locale={locale} onClose={() => setShowShare(false)} />}
    </main>
  );
}

function InvalidResult({ locale, action }: { locale: Locale; action: "quiz" | "result" }) {
  return <main className="result-page"><PageContainer className="result-shell"><div className="empty-state"><span className="empty-state__icon">!</span><h1>{t(locale, "invalidResult")}</h1><p>{t(locale, "invalidResultBody")}</p><Link className="button button--primary" to={action === "quiz" ? "/quiz" : "/result"}>{t(locale, action === "quiz" ? "start" : "viewPreview")}</Link></div></PageContainer></main>;
}
