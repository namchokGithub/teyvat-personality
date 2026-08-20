import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button, ContentCard, PageContainer } from "../components/common";
import { AnswerOption, QuizProgress } from "../components/quiz";
import { mockQuestions } from "../data/mock-ui";
import { useDialogAccessibility, useQuizProgress } from "../hooks";
import { t } from "../i18n";
import type { Locale } from "../types";

export function QuizPage({ locale }: { locale: Locale }) {
  const navigate = useNavigate();
  const { state, selectAnswer, goToQuestion, complete, reset } = useQuizProgress();
  const [showReset, setShowReset] = useState(false);
  const resetDialogRef = useRef<HTMLDivElement>(null);
  const questionHeadingRef = useRef<HTMLHeadingElement>(null);
  const closeReset = useCallback(() => setShowReset(false), []);
  useDialogAccessibility(resetDialogRef, closeReset, showReset);
  const current = Math.min(state.currentQuestionIndex, mockQuestions.length - 1);
  const question = mockQuestions[current];
  const selected = state.answers[question.id];
  useEffect(() => { questionHeadingRef.current?.focus({ preventScroll: true }); }, [current]);
  const advance = () => { if (current === mockQuestions.length - 1) { complete(); navigate("/matching"); } else goToQuestion(current + 1); };
  return <main className="quiz-page"><PageContainer className="quiz-shell"><div className="quiz-shell__top"><span>{t(locale, "question")} {String(current + 1).padStart(2, "0")} / 24</span><span>{t(locale, "selectHint")}</span><button className="text-button" onClick={() => setShowReset(true)}>{t(locale, "resetQuiz")}</button></div><QuizProgress current={current + 1} total={mockQuestions.length} /><ContentCard className="question-card"><span className="question-card__number" aria-hidden="true">{String(current + 1).padStart(2, "0")}</span><h1 ref={questionHeadingRef} tabIndex={-1}>{question.prompt[locale]}</h1><div className="sr-only" aria-live="polite">{t(locale, "question")} {current + 1} / {mockQuestions.length}: {question.prompt[locale]}</div><div className="answers-list" role="radiogroup" aria-label={question.prompt[locale]}>{question.answers.map((answer) => <AnswerOption key={answer.id} label={answer.label} locale={locale} selected={selected === answer.id} onSelect={() => selectAnswer(question.id, answer.id)} />)}</div></ContentCard><div className="quiz-actions"><Button variant="secondary" disabled={current === 0} onClick={() => goToQuestion(current - 1)}><ArrowLeft size={18} aria-hidden="true" />{t(locale, "back")}</Button><Button disabled={!selected} onClick={advance}>{current === 23 ? t(locale, "finish") : t(locale, "next")}<ArrowRight size={18} aria-hidden="true" /></Button></div></PageContainer>{showReset && <div className="dialog-backdrop" role="presentation" onMouseDown={closeReset}><div ref={resetDialogRef} className="dialog" role="dialog" aria-modal="true" aria-labelledby="reset-title" aria-describedby="reset-description" tabIndex={-1} onMouseDown={(event) => event.stopPropagation()}><button className="dialog__close" onClick={closeReset} aria-label={t(locale, "cancel")}><X size={18} aria-hidden="true" /></button><h2 id="reset-title">{t(locale, "resetTitle")}</h2><p id="reset-description">{t(locale, "resetBody")}</p><div className="dialog__actions"><Button variant="secondary" onClick={closeReset}>{t(locale, "cancel")}</Button><Button onClick={() => { reset(); closeReset(); }}>{t(locale, "confirmReset")}</Button></div></div></div>}</main>;
}
