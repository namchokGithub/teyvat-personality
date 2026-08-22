import { ArrowRight, Compass, Sparkles, WandSparkles, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { Button, ContentCard, PageContainer } from "../components/common";
import paimonArtwork from "../assets/images/paimon_hello.png";
import featCharBG from "../assets/images/characters/full/varka.png";
import nahidaWishArtwork from "../assets/images/characters/full/nahida_wish.png";
import neuvilletteArtwork from "../assets/images/characters/full/nicole.png";
import {
  beginQuizFromNavigation,
  useDialogAccessibility,
  hasSavedQuizProgress,
} from "../hooks";
import { t } from "../i18n";
import type { Locale } from "../types";
import { readPlayerName, savePlayerName } from "../utils/player-profile";

function renderTextWithBreaks(text: string) {
  const lines = text.split(/<br\s*\/?\s*>/i);

  return lines.map((line, index) => (
    <span key={`${line}-${index}`}>
      {line}
      {index < lines.length - 1 && <br />}
    </span>
  ));
}

export function LandingPage({ locale }: { locale: Locale }) {
  const navigate = useNavigate();
  const location = useLocation();
  const requestName = Boolean(
    (location.state as { requestName?: boolean } | null)?.requestName,
  );
  const [canResume] = useState(hasSavedQuizProgress);
  const [showNameDialog, setShowNameDialog] = useState(() => requestName);
  const [name, setName] = useState(readPlayerName);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeNameDialog = useCallback(() => setShowNameDialog(false), []);

  useEffect(() => {
    if (requestName) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, navigate, requestName]);

  useDialogAccessibility(dialogRef, closeNameDialog, showNameDialog);
  const features = [
    {
      Icon: Sparkles,
      title: "featureCharacter",
      body: "featureCharacterBody",
      variant: "character",
      artwork: featCharBG,
    },
    {
      Icon: Compass,
      title: "featureVision",
      body: "featureVisionBody",
      variant: "vision",
      artwork: nahidaWishArtwork,
    },
    {
      Icon: WandSparkles,
      title: "featureShare",
      body: "featureShareBody",
      variant: "share",
      artwork: neuvilletteArtwork,
    },
  ] as const;
  const startQuiz = () => {
    if (canResume) {
      navigate("/quiz");
      return;
    }
    setShowNameDialog(true);
  };
  const confirmName = () => {
    savePlayerName(name);
    beginQuizFromNavigation();
    closeNameDialog();
    navigate("/quiz", { state: { beginQuiz: true } });
  };

  return (
    <main className="landing-page">
      <PageContainer className="hero">
        <div className="hero__copy">
          <span className="eyebrow">
            <span className="eyebrow__icon" aria-hidden="true" />
            {t(locale, "eyebrow")}
          </span>
          <h1>{renderTextWithBreaks(t(locale, "heroTitle"))}</h1>
          <p>{t(locale, "heroBody")}</p>
          <div className="hero__actions">
            <Button onClick={startQuiz}>
              {t(locale, canResume ? "resume" : "start")}
              <ArrowRight size={18} />
            </Button>
          </div>
          <span className="hero__meta">{t(locale, "meta")}</span>
        </div>
        <div className="hero-art" aria-hidden="true">
          <span className="hero-art__orb hero-art__orb--one" />
          <span className="hero-art__orb hero-art__orb--two" />
          <div className="hero-art__card">
            <img className="hero-art__character" src={paimonArtwork} alt="" />
            <Sparkles size={54} />
            <strong>{renderTextWithBreaks(t(locale, "heroArtTitle"))}</strong>
            <small>{t(locale, "heroArtMeta")}</small>
          </div>
        </div>
      </PageContainer>
      <PageContainer className="feature-grid">
        {features.map(({ Icon, title, body, variant, artwork }) => (
          <ContentCard
            key={title}
            className={`feature-card feature-card--${variant}`}
          >
            <img className="feature-card__art" src={artwork} alt="" />
            <span className="feature-card__icon">
              <Icon size={22} />
            </span>
            <h2>{t(locale, title)}</h2>
            <p>{t(locale, body)}</p>
          </ContentCard>
        ))}
      </PageContainer>
      {showNameDialog && (
        <div
          className="dialog-backdrop"
          role="presentation"
          onMouseDown={closeNameDialog}
        >
          <div
            ref={dialogRef}
            className="dialog name-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="name-title"
            tabIndex={-1}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="dialog__close"
              onClick={closeNameDialog}
              aria-label={t(locale, "cancel")}
            >
              <X size={18} aria-hidden="true" />
            </button>
            <span className="section-kicker">Teyvat Personalities</span>
            <h2 id="name-title">{t(locale, "nameTitle")}</h2>
            <p>{t(locale, "nameBody")}</p>
            <label className="name-field">
              <span>{t(locale, "nameLabel")}</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={40}
                autoFocus
                placeholder={t(locale, "namePlaceholder")}
                onKeyDown={(event) => {
                  if (event.key === "Enter") confirmName();
                }}
              />
            </label>
            <div className="dialog__actions">
              <Button variant="secondary" onClick={closeNameDialog}>
                {t(locale, "cancel")}
              </Button>
              <Button onClick={confirmName}>{t(locale, "confirmName")}</Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
