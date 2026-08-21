export type Locale = "th" | "en";

export const DIMENSION_IDS = ["social", "decision", "lifestyle", "adventure", "responsibility", "expression"] as const;
export type DimensionId = (typeof DIMENSION_IDS)[number];

export const TRAIT_IDS = [
  "passion", "enthusiasm", "selfExpression", "determination", "optimism",
  "ideals", "adaptability", "responsibility", "creativity", "perseverance",
  "freedom", "acceptance", "sensitivity", "selflessness",
  "individuality", "independence", "confidence", "nonconformity",
  "growth", "curiosity", "knowledge", "learning", "selfDevelopment",
  "innerConflict", "contradiction", "identity", "introspection", "resilience",
  "resolve", "stability", "discipline", "reliability",
  "leadership", "empathy", "ambition", "loyalty", "idealism", "humor", "competitiveness",
] as const;
export type TraitId = (typeof TRAIT_IDS)[number];

export interface LocalizedText {
  th: string;
  en: string;
}

export interface QuizQuestion {
  id: string;
  prompt: LocalizedText;
  answers: Array<{ id: string; label: LocalizedText }>;
}

export interface ScoredQuizQuestion extends QuizQuestion {
  answers: Array<{
    id: string;
    label: LocalizedText;
    scores: {
      dimensions: Partial<Record<DimensionId, number>>;
      traits: Partial<Record<TraitId, number>>;
    };
  }>;
}

export interface TraitDefinition {
  id: TraitId;
  label: LocalizedText;
  description: LocalizedText;
}

export interface CharacterPersonalityProfile {
  id: string;
  personality: Record<DimensionId, number>;
  traits: Partial<Record<TraitId, number>>;
  strengths: string[];
  weaknesses: string[];
}

export interface ResultInterpretation {
  title: LocalizedText;
  summary: LocalizedText;
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

export type ArtworkVariant = "head" | "full";

export interface CharacterArtwork {
  characterId: string;
  variant: ArtworkVariant;
  url: string;
  alt: LocalizedText;
  source: string;
  licenseOrUsageNote: string;
}
