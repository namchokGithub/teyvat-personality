export const MATCHING_ERROR_CATEGORIES = [
  "data-load",
  "calculation",
  "storage",
  "navigation",
] as const;
export type MatchingErrorCategory = (typeof MATCHING_ERROR_CATEGORIES)[number];

export class MatchingError extends Error {
  readonly category: MatchingErrorCategory;

  constructor(
    category: MatchingErrorCategory,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "MatchingError";
    this.category = category;
  }
}

export function matchingErrorCategory(error: unknown): MatchingErrorCategory {
  return error instanceof MatchingError ? error.category : "calculation";
}
