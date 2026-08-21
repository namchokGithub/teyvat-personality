import { useCallback, useEffect, useState } from "react";

import type { QuizProgressState } from "../types";
import { ALGORITHM_VERSION, QUESTION_VERSION } from "../engine";
import { clearQuizResult } from "../utils/quiz-result";

const STORAGE_KEY = "teyvat-quiz-progress-v2";
const QUIZ_IDLE_TIMEOUT_MS = 5 * 60 * 1000;

const createInitialState = (): QuizProgressState => {
  const now = new Date().toISOString();
  return { version: 2, questionVersion: QUESTION_VERSION, algorithmVersion: ALGORITHM_VERSION, currentQuestionIndex: 0, answers: {}, startedAt: now, updatedAt: now, completedAt: null };
};

function readStoredState(): QuizProgressState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<QuizProgressState>;
    if (value.version !== 2 || value.questionVersion !== QUESTION_VERSION || typeof value.currentQuestionIndex !== "number" || !value.answers) return null;
    if (!value.completedAt && (!value.updatedAt || Date.now() - Date.parse(value.updatedAt) > QUIZ_IDLE_TIMEOUT_MS)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return value as QuizProgressState;
  } catch {
    return null;
  }
}

export function hasSavedQuizProgress() {
  const state = readStoredState();
  return Boolean(state && !state.completedAt && Object.keys(state.answers).length > 0);
}

export function useQuizProgress() {
  const [state, setState] = useState<QuizProgressState>(() => readStoredState() ?? createInitialState());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const selectAnswer = useCallback((questionId: string, answerId: string) => {
    setState((value) => ({ ...value, answers: { ...value.answers, [questionId]: answerId }, updatedAt: new Date().toISOString() }));
  }, []);

  const goToQuestion = useCallback((index: number) => {
    setState((value) => ({ ...value, currentQuestionIndex: index, updatedAt: new Date().toISOString() }));
  }, []);

  const complete = useCallback(() => {
    setState((value) => {
      const now = new Date().toISOString();
      const completed = { ...value, completedAt: now, updatedAt: now };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
      return completed;
    });
  }, []);

  const reset = useCallback(() => {
    clearQuizResult();
    setState(createInitialState());
  }, []);

  return { state, selectAnswer, goToQuestion, complete, reset };
}
