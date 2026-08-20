export type Locale = "th" | "en";

export interface LocalizedText {
  th: string;
  en: string;
}

export interface QuizQuestion {
  id: string;
  prompt: LocalizedText;
  answers: Array<{ id: string; label: LocalizedText }>;
}

export interface CharacterMatch {
  characterId: string;
  name: string;
  element: string;
  region: string;
  compatibility: number;
  title: LocalizedText;
  summary: LocalizedText;
  matchingTraits: LocalizedText[];
  artworkUrl?: string;
}

export interface VisionMatch {
  element: string;
  affinity: number;
  summary: LocalizedText;
}

export interface QuizProgressState {
  version: 1;
  currentQuestionIndex: number;
  answers: Record<string, string>;
  startedAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface CharacterDetail {
  id: string;
  name: string;
  title: LocalizedText;
  description: LocalizedText;
  region: string | null;
  element: string | null;
  weapon: string | null;
  rarity: number | null;
}

export interface CharacterSummary {
  id: string;
  name: string;
  region: string | null;
  element: string | null;
  rarity: number | null;
}
