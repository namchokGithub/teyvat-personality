import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { Button, ContentCard, PageContainer } from "../components/common";
import { AnswerOption, QuizProgress } from "../components/quiz";
import { questionById } from "../data/quiz";
import {
  useDialogAccessibility,
  useQuizProgress,
  useStorageDegraded,
} from "../hooks";
import { t } from "../i18n";
import type { Locale } from "../types";
import { readQuizResult } from "../utils/quiz-result";

export function QuizPage({ locale }: { locale: Locale }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { state, selectAnswer, goToQuestion, complete, reset } =
    useQuizProgress();
  const storageDegraded = useStorageDegraded();
  const [showReset, setShowReset] = useState(false);
  const resetDialogRef = useRef<HTMLDivElement>(null);
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  const closeReset = useCallback(() => setShowReset(false), []);
  useDialogAccessibility(resetDialogRef, closeReset, showReset);
  const questionCount = state.questionOrder.length;
  const current = Math.min(
    state.currentQuestionIndex,
    state.questionOrder.length - 1,
  );
  const question = questionById.get(state.questionOrder[current])!;
  const orderedAnswers = state.answerOrder[question.id].map((answerId) =>
    question.answers.find(({ id }) => id === answerId)!,
  );
  const selected = state.answers[question.id];
  const hasProgress =
    Object.keys(state.answers).length > 0 ||
    Boolean((location.state as { beginQuiz?: boolean } | null)?.beginQuiz);
  useEffect(() => {
    questionHeadingRef.current?.focus({ preventScroll: true });
  }, [current]);
  useEffect(() => {
    if (state.questionOrder.length - current <= 2) {
      void import("../data/personality/character-personalities-bundle");
    }
  }, [current, state.questionOrder.length]);
  if (state.completedAt && readQuizResult())
    return <Navigate to="/result" replace />;
  if (!hasProgress)
    return <Navigate to="/" replace state={{ requestName: true }} />;
  const advance = () => {
    if (current === state.questionOrder.length - 1) {
      complete();
      navigate("/matching");
    } else goToQuestion(current + 1);
  };
  return (
    <main
      className="quiz-page"
      onContextMenu={(event) => event.preventDefault()}
    >
      <PageContainer className="quiz-shell">
        <div className="quiz-shell__top">
          <span>
            {t(locale, "question")} {String(current + 1).padStart(2, "0")} /{" "}
            {questionCount}
          </span>
          <span>{t(locale, "selectHint")}</span>
          <button className="text-button" onClick={() => setShowReset(true)}>
            {t(locale, "resetQuiz")}
          </button>
        </div>
        <QuizProgress current={current + 1} total={questionCount} />
        {storageDegraded && (
          <p className="quiz-shell__storage-notice" role="status">
            {t(locale, "storageDegradedNotice")}
          </p>
        )}
        <ContentCard className="question-card">
          <span className="question-card__number" aria-hidden="true">
            {String(current + 1).padStart(2, "0")}
          </span>
          <h1 ref={questionHeadingRef} tabIndex={-1}>
            {question.prompt[locale]}
          </h1>
          <div className="sr-only" aria-live="polite">
            {t(locale, "question")} {current + 1} / {questionCount}:{" "}
            {question.prompt[locale]}
          </div>
          <div
            className="answers-list"
            role="radiogroup"
            aria-label={question.prompt[locale]}
          >
            {orderedAnswers.map((answer) => (
              <AnswerOption
                key={answer.id}
                label={answer.label}
                locale={locale}
                selected={selected === answer.id}
                onSelect={() => selectAnswer(question.id, answer.id)}
              />
            ))}
          </div>
        </ContentCard>
        <div className="quiz-actions">
          <Button
            variant="secondary"
            disabled={current === 0}
            onClick={() => goToQuestion(current - 1)}
          >
            <ArrowLeft size={18} aria-hidden="true" />
            {t(locale, "back")}
          </Button>
          <Button disabled={!selected} onClick={advance}>
            {current === state.questionOrder.length - 1
              ? t(locale, "finish")
              : t(locale, "next")}
            <ArrowRight size={18} aria-hidden="true" />
          </Button>
        </div>
      </PageContainer>
      {showReset && (
        <div
          className="dialog-backdrop"
          role="presentation"
          onMouseDown={closeReset}
        >
          <div
            ref={resetDialogRef}
            className="dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-title"
            aria-describedby="reset-description"
            tabIndex={-1}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="dialog__close"
              onClick={closeReset}
              aria-label={t(locale, "cancel")}
            >
              <X size={18} aria-hidden="true" />
            </button>
            <h2 id="reset-title">{t(locale, "resetTitle")}</h2>
            <p id="reset-description">{t(locale, "resetBody")}</p>
            <div className="dialog__actions">
              <Button variant="secondary" onClick={closeReset}>
                {t(locale, "cancel")}
              </Button>
              <Button
                onClick={() => {
                  reset();
                  closeReset();
                  navigate("/", { state: { requestName: true } });
                }}
              >
                {t(locale, "confirmReset")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
