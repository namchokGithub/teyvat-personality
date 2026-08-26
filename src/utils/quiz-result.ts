import { ALGORITHM_VERSION, QUESTION_VERSION } from "../engine";
import { safeGetItem, safeRemoveItem, safeSetItem } from "../lib/safe-storage";
import type { QuizResult } from "../types";

const RESULT_STORAGE_KEY = "teyvat-quiz-result-v1";
export const QUIZ_RESULT_UPDATED_EVENT = "teyvat:quiz-result-updated";

export function saveQuizResult(result: QuizResult): boolean {
  const saved = safeSetItem(RESULT_STORAGE_KEY, JSON.stringify(result));
  if (saved) window.dispatchEvent(new Event(QUIZ_RESULT_UPDATED_EVENT));
  return saved;
}

export function readQuizResult(): QuizResult | null {
  try {
    const raw = safeGetItem(RESULT_STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<QuizResult>;
    if (
      value.version !== 1 ||
      value.questionVersion !== QUESTION_VERSION ||
      value.algorithmVersion !== ALGORITHM_VERSION ||
      !value.profile ||
      !value.characterMatches?.length ||
      !value.visionMatches?.length
    )
      return null;
    return value as QuizResult;
  } catch {
    return null;
  }
}

export function clearQuizResult() {
  safeRemoveItem(RESULT_STORAGE_KEY);
  window.dispatchEvent(new Event(QUIZ_RESULT_UPDATED_EVENT));
}
