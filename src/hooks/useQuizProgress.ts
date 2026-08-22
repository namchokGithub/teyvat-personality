import { useCallback, useEffect, useState } from "react";

import type { QuizProgressState } from "../types";
import { ALGORITHM_VERSION, QUESTION_VERSION } from "../engine";
import { questionById, questions } from "../data/quiz";
import { clearQuizResult } from "../utils/quiz-result";

const STORAGE_KEY = "teyvat-quiz-progress-v3";
const QUIZ_IDLE_TIMEOUT_MS = 5 * 60 * 1000;

const randomSeed = () => crypto.getRandomValues(new Uint32Array(1))[0];
const seededRandom = (seed: number) => () => {
  seed |= 0;
  seed = seed + 0x6D2B79F5 | 0;
  let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
  value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
  return ((value ^ value >>> 14) >>> 0) / 4294967296;
};
const shuffle = <T,>(values: readonly T[], random: () => number) => {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
};

const createInitialState = (): QuizProgressState => {
  const now = new Date().toISOString();
  const seed = randomSeed();
  const random = seededRandom(seed);
  return {
    version: 3,
    questionVersion: QUESTION_VERSION,
    algorithmVersion: ALGORITHM_VERSION,
    seed,
    questionOrder: shuffle(questions.map(({ id }) => id), random),
    answerOrder: Object.fromEntries(questions.map((question) => [question.id, shuffle(question.answers.map(({ id }) => id), random)])),
    currentQuestionIndex: 0,
    answers: {},
    startedAt: now,
    updatedAt: now,
    completedAt: null,
  };
};

const sameIds = (actual: string[] | undefined, expected: string[]) =>
  Boolean(actual && actual.length === expected.length && new Set(actual).size === expected.length && expected.every((id) => actual.includes(id)));

function readStoredState(): QuizProgressState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<QuizProgressState>;
    if (value.version !== 3 || value.questionVersion !== QUESTION_VERSION || value.algorithmVersion !== ALGORITHM_VERSION || typeof value.seed !== "number" || !Number.isInteger(value.currentQuestionIndex) || !value.answers) return null;
    if (!sameIds(value.questionOrder, questions.map(({ id }) => id))) return null;
    if (questions.some((question) => !sameIds(value.answerOrder?.[question.id], question.answers.map(({ id }) => id)))) return null;
    if (value.currentQuestionIndex! < 0 || value.currentQuestionIndex! >= questions.length) return null;
    if (Object.entries(value.answers).some(([questionId, answerId]) => !questionById.get(questionId)?.answers.some(({ id }) => id === answerId))) return null;
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

export function beginQuizFromNavigation() {
  const state = readStoredState();
  if (!state?.completedAt) return;
  localStorage.removeItem(STORAGE_KEY);
  clearQuizResult();
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
    const initial = createInitialState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    setState(initial);
  }, []);

  return { state, selectAnswer, goToQuestion, complete, reset };
}
