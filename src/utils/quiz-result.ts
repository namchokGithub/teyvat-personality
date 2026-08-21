import type { QuizResult } from "../types";

const RESULT_STORAGE_KEY = "teyvat-quiz-result-v1";

export function saveQuizResult(result: QuizResult) {
  localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(result));
}

export function readQuizResult(): QuizResult | null {
  try {
    const raw = localStorage.getItem(RESULT_STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<QuizResult>;
    if (value.version !== 1 || !value.profile || !value.characterMatches?.length || !value.visionMatches?.length) return null;
    return value as QuizResult;
  } catch {
    return null;
  }
}

export function clearQuizResult() {
  localStorage.removeItem(RESULT_STORAGE_KEY);
}
