import { ALGORITHM_VERSION, QUESTION_VERSION } from "../engine";
import { MatchingError } from "../lib/matching-errors";
import type { QuizResult } from "../types";

const RESULT_STORAGE_KEY = "teyvat-quiz-result-v1";
export const QUIZ_RESULT_UPDATED_EVENT = "teyvat:quiz-result-updated";

export function saveQuizResult(result: QuizResult) {
  try {
    localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(result));
  } catch (error) {
    throw new MatchingError("storage", "Failed to save the quiz result", {
      cause: error,
    });
  }
  window.dispatchEvent(new Event(QUIZ_RESULT_UPDATED_EVENT));
}

export function readQuizResult(): QuizResult | null {
  try {
    const raw = localStorage.getItem(RESULT_STORAGE_KEY);
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
  localStorage.removeItem(RESULT_STORAGE_KEY);
  window.dispatchEvent(new Event(QUIZ_RESULT_UPDATED_EVENT));
}
