import { useCallback, useEffect, useState } from "react";

import type { QuizProgressState } from "../types";

const STORAGE_KEY = "teyvat-quiz-progress-v1";

const createInitialState = (): QuizProgressState => {
  const now = new Date().toISOString();
  return { version: 1, currentQuestionIndex: 0, answers: {}, startedAt: now, updatedAt: now, completedAt: null };
};

function readStoredState(): QuizProgressState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<QuizProgressState>;
    if (value.version !== 1 || typeof value.currentQuestionIndex !== "number" || !value.answers) return null;
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
    setState((value) => ({ ...value, completedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
  }, []);

  const reset = useCallback(() => setState(createInitialState()), []);

  return { state, selectAnswer, goToQuestion, complete, reset };
}
