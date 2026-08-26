import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import qiqiErrorImage from "../assets/images/qiqi-01.png";
import { Button } from "../components/common";
import { t, type MessageKey } from "../i18n";
import { useQuizProgress } from "../hooks";
import { calculateQuizResult } from "../data/personality/calculate-result";
import { saveQuizResult } from "../utils/quiz-result";
import {
  MatchingError,
  type MatchingErrorCategory,
} from "../lib/matching-errors";
import type { Locale } from "../types";

const MATCHING_DURATION_MS = 1_200;
const matchingStages = ["profile", "character", "vision", "ready"] as const;
type MatchingStage = (typeof matchingStages)[number];

const matchingErrorBodyKeyByCategory: Record<
  MatchingErrorCategory,
  MessageKey
> = {
  "data-load": "matchingErrorDataLoad",
  calculation: "matchingErrorCalculation",
  storage: "matchingErrorStorage",
  navigation: "matchingErrorNavigation",
};

export function MatchingPage({ locale }: { locale: Locale }) {
  const navigate = useNavigate();
  const { state } = useQuizProgress();
  const [stage, setStage] = useState<MatchingStage>(() =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "ready"
      : "profile",
  );
  const [error, setError] = useState<MatchingError | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const timers = reducedMotion
      ? []
      : [
          window.setTimeout(() => setStage("character"), 300),
          window.setTimeout(() => setStage("vision"), 650),
          window.setTimeout(() => setStage("ready"), 950),
        ];
    const run = async () => {
      try {
        const [result] = await Promise.all([
          calculateQuizResult(state.answers),
          new Promise((resolve) =>
            window.setTimeout(
              resolve,
              reducedMotion ? 0 : MATCHING_DURATION_MS,
            ),
          ),
        ]);
        if (!active) return;
        saveQuizResult(result);
        navigate("/result", { replace: true, state: { result } });
      } catch (caughtError) {
        if (!active) return;
        setError(
          caughtError instanceof MatchingError
            ? caughtError
            : new MatchingError("calculation", "Matching failed", {
                cause: caughtError,
              }),
        );
      }
    };
    void run();
    return () => {
      active = false;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [navigate, state.answers, attempt]);

  if (error) {
    return (
      <MatchingErrorState
        locale={locale}
        category={error.category}
        onRetry={() => {
          setError(null);
          setStage(
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "ready"
              : "profile",
          );
          setAttempt((value) => value + 1);
        }}
        onBackToQuiz={() => navigate("/quiz", { replace: true })}
      />
    );
  }

  const stageIndex = matchingStages.indexOf(stage);
  const messageKey = `matching${stage[0].toUpperCase()}${stage.slice(1)}` as
    | "matchingProfile"
    | "matchingCharacter"
    | "matchingVision"
    | "matchingReady";

  return (
    <main className="matching-page">
      <div
        className="matching-state"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        data-stage={stage}
      >
        <span className="matching-state__rings">
          <Sparkles size={36} />
        </span>
        <h1>{t(locale, "matchingTitle")}</h1>
        <p key={stage} className="matching-state__message">
          {t(locale, messageKey)}
        </p>
        <ol className="matching-state__steps" aria-hidden="true">
          {matchingStages.map((item, index) => (
            <li key={item} className={index <= stageIndex ? "is-active" : ""} />
          ))}
        </ol>
        <span className="matching-state__bar" />
      </div>
    </main>
  );
}

function MatchingErrorState({
  locale,
  category,
  onRetry,
  onBackToQuiz,
}: {
  locale: Locale;
  category: MatchingErrorCategory;
  onRetry: () => void;
  onBackToQuiz: () => void;
}) {
  return (
    <main className="matching-page">
      <div className="empty-state matching-error" role="alert">
        <div className="matching-error__art" aria-hidden="true">
          <img src={qiqiErrorImage} alt="" />
        </div>
        <div className="matching-error__content">
          <h1>{t(locale, "matchingErrorTitle")}</h1>
          <p className="matching-error__body">
            {t(locale, matchingErrorBodyKeyByCategory[category])}
          </p>
          <div className="matching-error__actions">
            {category !== "navigation" && (
              <Button
                onClick={
                  // A dynamic import() rejection is cached by the browser's module
                  // registry for the page's lifetime — recomputing in place can never
                  // re-fetch the failed chunk, so a data-load retry needs a real reload.
                  category === "data-load"
                    ? () => window.location.reload()
                    : onRetry
                }
              >
                {t(locale, "matchingErrorRetry")}
              </Button>
            )}
            <Button variant="secondary" onClick={onBackToQuiz}>
              {t(locale, "matchingErrorBackToQuiz")}
            </Button>
          </div>
          <p className="matching-error__hint">
            {t(locale, "matchingErrorOpenBrowserHint")}
          </p>
        </div>
      </div>
    </main>
  );
}
