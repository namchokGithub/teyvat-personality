import { BookOpen, Download, Link2, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { Button, ContentCard, PageContainer } from "../components/common";
import { CharacterResultCard, VisionCard } from "../components/result";
import { useQuizProgress } from "../hooks";
import { t } from "../i18n";
import { firebaseApp } from "../lib/firebase";
import type { CharacterMatch, Locale, QuizResult, VisionMatch } from "../types";
import { loadCharacterById } from "../data/characters/repository";
import { createCharacterResultPreview } from "../utils/character-preview";
import { canPublishSharedResult, recordSharedResultPublish } from "../utils/share-throttle";
import { copyText, downloadShareCard } from "../utils/share-result";
import { readQuizResult } from "../utils/quiz-result";

export function ResultPage({ locale }: { locale: Locale }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { reset } = useQuizProgress();
  const [result] = useState(() => readQuizResult());
  const previewId = searchParams.get("preview");
  const [preview, setPreview] = useState<
    | {
        character: CharacterMatch;
        vision: VisionMatch;
      }
    | null
    | undefined
  >(undefined);
  const [downloadError, setDownloadError] = useState(false);
  const [shareLinkState, setShareLinkState] = useState<
    "idle" | "publishing" | "published" | "throttled" | "error"
  >("idle");
  const [sharedUrl, setSharedUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    if (!previewId) {
      return () => {
        active = false;
      };
    }
    loadCharacterById(previewId).then((value) => {
      if (active)
        setPreview(value ? createCharacterResultPreview(value) : null);
    });
    return () => {
      active = false;
    };
  }, [previewId]);

  if (previewId && preview === undefined) return null;
  const character = previewId
    ? preview?.character
    : result?.characterMatches[0];
  const vision = previewId ? preview?.vision : result?.visionMatches[0];
  if (!character || !vision) return <InvalidResult locale={locale} />;

  const downloadCard = async () => {
    try {
      await downloadShareCard(character, vision, locale);
      setDownloadError(false);
    } catch {
      setDownloadError(true);
    }
  };

  const createShareLink = async (quizResult: QuizResult) => {
    if (sharedUrl) {
      await copyText(sharedUrl);
      setShareLinkState("published");
      return;
    }
    if (!canPublishSharedResult()) {
      setShareLinkState("throttled");
      return;
    }
    setShareLinkState("publishing");
    try {
      const [{ getFirestore }, { publishSharedResult }] = await Promise.all([
        import("firebase/firestore"),
        import("../lib/shared-result"),
      ]);
      const db = getFirestore(firebaseApp);
      const id = await publishSharedResult(db, character, vision, {
        questionVersion: quizResult.questionVersion,
        algorithmVersion: quizResult.algorithmVersion,
      });
      recordSharedResultPublish();
      const url = `${window.location.origin}${window.location.pathname}#/shared/${id}`;
      setSharedUrl(url);
      await copyText(url);
      setShareLinkState("published");
    } catch {
      setShareLinkState("error");
    }
  };

  return (
    <main className="result-page">
      <PageContainer className="result-shell">
        <div className="result-heading">
          <span className="eyebrow">
            <Sparkles size={15} />
            {t(locale, "resultEyebrow")}
          </span>
          {previewId && (
            <p className="mock-notice">{t(locale, "mockNotice")}</p>
          )}
        </div>
        <CharacterResultCard character={character} locale={locale} />
        <div className="result-details">
          {character.matchingTraits.length > 0 && (
            <ContentCard>
              <span className="section-kicker">
                {t(locale, "sharedTraits")}
              </span>
              <div className="trait-list">
                {character.matchingTraits.map((trait) => (
                  <span key={trait.en}>{trait[locale]}</span>
                ))}
              </div>
            </ContentCard>
          )}
          <VisionCard
            vision={vision}
            locale={locale}
            title={t(locale, "visionTitle")}
          />
        </div>
        <div className="result-actions">
          <Button onClick={() => void downloadCard()}>
            <Download size={18} />
            {t(locale, "downloadCard")}
          </Button>
          <Link
            className="button button--secondary"
            to={`/characters/${character.characterId}`}
          >
            <BookOpen size={18} />
            {t(locale, "characterDetails")}
          </Link>
          {!previewId && result && (
            <Button
              variant="secondary"
              onClick={() => void createShareLink(result)}
              disabled={shareLinkState === "publishing"}
            >
              <Link2 size={18} />
              {shareLinkState === "publishing"
                ? t(locale, "shareLinkCreating")
                : t(locale, "shareLinkCreate")}
            </Button>
          )}
          {!previewId && (
            <Button
              variant="secondary"
              onClick={() => {
                reset();
                navigate("/", { state: { requestName: true } });
              }}
            >
              <RotateCcw size={18} />
              {t(locale, "tryAgain")}
            </Button>
          )}
        </div>
        {shareLinkState === "published" && (
          <p className="result-action-success" role="status">
            {t(locale, "copiedLink")}
          </p>
        )}
        {shareLinkState === "throttled" && (
          <p className="result-action-error" role="status">
            {t(locale, "shareLinkThrottled")}
          </p>
        )}
        {shareLinkState === "error" && (
          <p className="result-action-error" role="status">
            {t(locale, "error")}
          </p>
        )}
        {downloadError && (
          <p className="result-action-error" role="status">
            Unable to download the card. Please try again.
          </p>
        )}
      </PageContainer>
    </main>
  );
}

function InvalidResult({ locale }: { locale: Locale }) {
  return (
    <main className="result-page">
      <PageContainer className="result-shell">
        <div className="empty-state">
          <span className="empty-state__icon">!</span>
          <h1>{t(locale, "invalidResult")}</h1>
          <p>{t(locale, "invalidResultBody")}</p>
          <Link className="button button--primary" to="/quiz">
            {t(locale, "start")}
          </Link>
        </div>
      </PageContainer>
    </main>
  );
}
