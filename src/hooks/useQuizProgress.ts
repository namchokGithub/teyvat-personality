import { useCallback, useEffect, useState } from "react";

import {
  DIMENSION_IDS,
  type DimensionId,
  type QuizProgressState,
} from "../types";
import {
  ALGORITHM_VERSION,
  QUESTION_VERSION,
  QUESTIONS_PER_DIMENSION,
} from "../engine";
import { questionById, questions } from "../data/quiz";
import { safeGetItem, safeRemoveItem, safeSetItem } from "../lib/safe-storage";

const EXPECTED_QUESTION_COUNT = DIMENSION_IDS.length * QUESTIONS_PER_DIMENSION;

const STORAGE_KEY = "teyvat-quiz-progress-v3";
const QUIZ_IDLE_TIMEOUT_MS = 5 * 60 * 1000;

const randomSeed = () => crypto.getRandomValues(new Uint32Array(1))[0];
const seededRandom = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
};
const shuffle = <T>(values: readonly T[], random: () => number) => {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
};

const selectQuestionOrder = (random: () => number) => {
  const selected = DIMENSION_IDS.flatMap((dimensionId) => {
    const pool = questions
      .filter((question) => question.dimensionId === dimensionId)
      .map(({ id }) => id);
    return shuffle(pool, random).slice(0, QUESTIONS_PER_DIMENSION);
  });
  return shuffle(selected, random);
};

const createInitialState = (): QuizProgressState => {
  const now = new Date().toISOString();
  const seed = randomSeed();
  const random = seededRandom(seed);
  const questionOrder = selectQuestionOrder(random);
  return {
    version: 3,
    questionVersion: QUESTION_VERSION,
    algorithmVersion: ALGORITHM_VERSION,
    seed,
    questionOrder,
    answerOrder: Object.fromEntries(
      questionOrder.map((id) => [
        id,
        shuffle(
          questionById.get(id)!.answers.map(({ id: answerId }) => answerId),
          random,
        ),
      ]),
    ),
    currentQuestionIndex: 0,
    answers: {},
    startedAt: now,
    updatedAt: now,
    completedAt: null,
  };
};

const sameIds = (actual: string[] | undefined, expected: string[]) =>
  Boolean(
    actual &&
    actual.length === expected.length &&
    new Set(actual).size === expected.length &&
    expected.every((id) => actual.includes(id)),
  );

const isValidQuestionSelection = (
  order: string[] | undefined,
): order is string[] => {
  if (
    !order ||
    order.length !== EXPECTED_QUESTION_COUNT ||
    new Set(order).size !== order.length
  )
    return false;
  const counts = new Map<DimensionId, number>();
  for (const id of order) {
    const question = questionById.get(id);
    if (!question) return false;
    counts.set(
      question.dimensionId,
      (counts.get(question.dimensionId) ?? 0) + 1,
    );
  }
  return DIMENSION_IDS.every(
    (dimensionId) => counts.get(dimensionId) === QUESTIONS_PER_DIMENSION,
  );
};

function readStoredState(): QuizProgressState | null {
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<QuizProgressState>;
    if (
      value.version !== 3 ||
      value.questionVersion !== QUESTION_VERSION ||
      value.algorithmVersion !== ALGORITHM_VERSION ||
      typeof value.seed !== "number" ||
      !Number.isInteger(value.currentQuestionIndex) ||
      !value.answers
    )
      return null;
    const questionOrder = value.questionOrder;
    if (!isValidQuestionSelection(questionOrder)) return null;
    if (
      questionOrder.some(
        (id) =>
          !sameIds(
            value.answerOrder?.[id],
            questionById.get(id)!.answers.map(({ id: answerId }) => answerId),
          ),
      )
    )
      return null;
    if (
      value.currentQuestionIndex! < 0 ||
      value.currentQuestionIndex! >= questionOrder.length
    )
      return null;
    if (
      Object.entries(value.answers).some(
        ([questionId, answerId]) =>
          !questionById
            .get(questionId)
            ?.answers.some(({ id }) => id === answerId),
      )
    )
      return null;
    if (
      !value.completedAt &&
      (!value.updatedAt ||
        Date.now() - Date.parse(value.updatedAt) > QUIZ_IDLE_TIMEOUT_MS)
    ) {
      safeRemoveItem(STORAGE_KEY);
      return null;
    }
    return value as QuizProgressState;
  } catch {
    return null;
  }
}

export function hasSavedQuizProgress() {
  const state = readStoredState();
  return Boolean(
    state && !state.completedAt && Object.keys(state.answers).length > 0,
  );
}

export function beginQuizFromNavigation() {
  const state = readStoredState();
  if (!state?.completedAt) return;
  safeRemoveItem(STORAGE_KEY);
}

export function useQuizProgress() {
  const [state, setState] = useState<QuizProgressState>(
    () => readStoredState() ?? createInitialState(),
  );

  useEffect(() => {
    safeSetItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const selectAnswer = useCallback((questionId: string, answerId: string) => {
    setState((value) => ({
      ...value,
      answers: { ...value.answers, [questionId]: answerId },
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const goToQuestion = useCallback((index: number) => {
    setState((value) => ({
      ...value,
      currentQuestionIndex: index,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const complete = useCallback(() => {
    setState((value) => {
      const now = new Date().toISOString();
      const completed = { ...value, completedAt: now, updatedAt: now };
      safeSetItem(STORAGE_KEY, JSON.stringify(completed));
      return completed;
    });
  }, []);

  const reset = useCallback(() => {
    const initial = createInitialState();
    safeSetItem(STORAGE_KEY, JSON.stringify(initial));
    setState(initial);
  }, []);

  return { state, selectAnswer, goToQuestion, complete, reset };
}
