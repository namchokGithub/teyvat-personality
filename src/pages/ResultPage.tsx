import {
  BookOpen,
  ChevronDown,
  Download,
  RotateCcw,
  Share2,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import aetherImage from "../assets/images/Aether1.png";
import { Button, ContentCard, PageContainer } from "../components/common";
import {
  AdditionalCharacterCards,
  CharacterResultCard,
  VisionCard,
} from "../components/result";
import { ShareResultDialog } from "../components/share";
import { useQuizProgress } from "../hooks";
import { t } from "../i18n";
import { firestore } from "../lib/firebase";
import { reportShareFailure } from "../lib/share-error-reporting";
import type { CharacterMatch, Locale, QuizResult, VisionMatch } from "../types";
import { loadCharacterById } from "../data/characters/repository";
import { createCharacterResultPreview } from "../utils/character-preview";
import {
  canPublishSharedResult,
  recordSharedResultPublish,
} from "../utils/share-throttle";
import { downloadShareCard } from "../utils/share-result";
import { readQuizResult } from "../utils/quiz-result";

export function ResultPage({ locale }: { locale: Locale }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { reset } = useQuizProgress();
  const [result] = useState(
    () =>
      (location.state as { result?: QuizResult } | null)?.result ??
      readQuizResult(),
  );
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
  const [showAdditionalCharacters, setShowAdditionalCharacters] =
    useState(false);
  const [shareLinkState, setShareLinkState] = useState<
    "idle" | "publishing" | "published" | "throttled" | "error"
  >("idle");
  const [sharedUrl, setSharedUrl] = useState<string | null>(null);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
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
  const additionalCharacters = previewId
    ? []
    : (result?.characterMatches.slice(1, 4) ?? []);
  if (!character || !vision) return <InvalidResult locale={locale} />;

  const ensureSharedUrl = async (quizResult: QuizResult) => {
    if (sharedUrl) return sharedUrl;
    if (!canPublishSharedResult()) {
      setShareLinkState("throttled");
      return null;
    }
    setShareLinkState("publishing");
    try {
      const { publishSharedResult } = await import("../lib/shared-result");
      const id = await publishSharedResult(
        firestore,
        character,
        additionalCharacters,
        vision,
        {
          questionVersion: quizResult.questionVersion,
          algorithmVersion: quizResult.algorithmVersion,
        },
      );
      recordSharedResultPublish();
      const url = `${window.location.origin}${window.location.pathname}#/shared/${id}`;
      setSharedUrl(url);
      setShareLinkState("idle");
      return url;
    } catch (error) {
      reportShareFailure("create_share_link", error);
      setShareLinkState("error");
      return null;
    }
  };

  const downloadCard = async () => {
    try {
      const url =
        !previewId && result ? await ensureSharedUrl(result) : undefined;
      if (!previewId && !url) return;
      await downloadShareCard(character, vision, locale, url ?? undefined);
      setDownloadError(false);
    } catch (error) {
      reportShareFailure("generate_card", error);
      setDownloadError(true);
    }
  };

  const openShareDialog = async () => {
    if (!result) return;
    if (await ensureSharedUrl(result)) setShareDialogOpen(true);
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
        {additionalCharacters.length > 0 && (
          <section className="additional-characters">
            <button
              type="button"
              className="additional-characters__trigger"
              onClick={() => setShowAdditionalCharacters((value) => !value)}
              aria-expanded={showAdditionalCharacters}
              aria-controls="additional-characters"
            >
              <span>
                <Sparkles size={16} />
                {t(locale, "additionalCharacters")}
              </span>
              <ChevronDown size={18} aria-hidden="true" />
            </button>
            {showAdditionalCharacters && (
              <div id="additional-characters">
                <p>{t(locale, "additionalCharactersBody")}</p>
                <AdditionalCharacterCards
                  characters={additionalCharacters}
                  locale={locale}
                />
              </div>
            )}
          </section>
        )}
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
          <Button
            onClick={() => void downloadCard()}
            disabled={shareLinkState === "publishing"}
          >
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
              onClick={() => void openShareDialog()}
              disabled={shareLinkState === "publishing"}
            >
              <Share2 size={18} />
              {shareLinkState === "publishing"
                ? t(locale, "shareLinkCreating")
                : t(locale, "share")}
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
        {shareLinkState === "throttled" && (
          <p className="result-action-error" role="status">
            {t(locale, "shareLinkThrottled")}
          </p>
        )}
        {shareLinkState === "error" && (
          <p className="result-action-error" role="status">
            {t(locale, "shareErrorCreateLink")}
          </p>
        )}
        {downloadError && (
          <p className="result-action-error" role="status">
            {t(locale, "shareErrorGenerateCard")}
          </p>
        )}
      </PageContainer>
      {shareDialogOpen && sharedUrl && (
        <ShareResultDialog
          character={character}
          vision={vision}
          locale={locale}
          sharedUrl={sharedUrl}
          onClose={() => setShareDialogOpen(false)}
        />
      )}
    </main>
  );
}

function InvalidResult({ locale }: { locale: Locale }) {
  return (
    <main className="result-page">
      <PageContainer className="result-shell">
        <div className="empty-state">
          <img className="empty-state__image" src={aetherImage} alt="" />
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
