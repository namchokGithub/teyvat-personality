import { z } from "zod";

import { QUESTIONS_PER_DIMENSION } from "../engine";
import { DIMENSION_IDS, TRAIT_IDS, type CharacterPersonalityProfile, type ElementPersonalityProfile, type ScoredQuizQuestion, type TraitDefinition } from "../types";

const knownDimensionIds = new Set<string>(DIMENSION_IDS);
const knownTraitIds = new Set<string>(TRAIT_IDS);

export const localizedTextSchema = z.object({ th: z.string().min(1), en: z.string().min(1) });
export const dimensionIdSchema = z.enum(DIMENSION_IDS);
export const traitIdSchema = z.enum(TRAIT_IDS);

const scoreMapSchema = z.record(z.string(), z.number()).superRefine((value, context) => {
  for (const key of Object.keys(value)) {
    if (!knownDimensionIds.has(key)) context.addIssue({ code: z.ZodIssueCode.custom, message: `Unknown dimension id: ${key}` });
  }
});

const traitScoreMapSchema = z.record(z.string(), z.number()).superRefine((value, context) => {
  for (const key of Object.keys(value)) {
    if (!knownTraitIds.has(key)) context.addIssue({ code: z.ZodIssueCode.custom, message: `Unknown trait id: ${key}` });
  }
});

export const scoredQuizQuestionSchema = z.object({
  id: z.string().min(1),
  dimensionId: dimensionIdSchema,
  prompt: localizedTextSchema,
  answers: z.array(z.object({
    id: z.string().min(1),
    label: localizedTextSchema,
    scores: z.object({ dimensions: scoreMapSchema, traits: traitScoreMapSchema }),
  })).min(2),
});

export const traitDefinitionSchema = z.object({
  id: traitIdSchema,
  label: localizedTextSchema,
  description: localizedTextSchema,
});

export const characterPersonalityProfileSchema = z.object({
  id: z.string().min(1),
  personality: z.object({
    social: z.number().int().min(0).max(100),
    decision: z.number().int().min(0).max(100),
    lifestyle: z.number().int().min(0).max(100),
    adventure: z.number().int().min(0).max(100),
    responsibility: z.number().int().min(0).max(100),
    expression: z.number().int().min(0).max(100),
  }),
  traits: z.record(z.string(), z.number().min(0).max(1)).superRefine((value, context) => {
    for (const key of Object.keys(value)) {
      if (!knownTraitIds.has(key)) context.addIssue({ code: z.ZodIssueCode.custom, message: `Unknown trait id: ${key}` });
    }
  }),
  strengths: z.array(z.string().min(1)).min(3).max(5),
  weaknesses: z.array(z.string().min(1)).min(3).max(5),
});

export const elementPersonalityProfileSchema = z.object({
  elementId: z.string().min(1),
  personalityTheme: z.object({
    primary: traitIdSchema,
    secondary: z.array(traitIdSchema),
    traits: z.record(z.string(), z.number().min(0).max(1)).superRefine((value, context) => {
      for (const key of Object.keys(value)) {
        if (!knownTraitIds.has(key)) context.addIssue({ code: z.ZodIssueCode.custom, message: `Unknown trait id: ${key}` });
      }
    }),
  }),
});

function duplicateIds(values: Array<{ id: string }>) {
  const seen = new Set<string>();
  return values.filter(({ id }) => seen.has(id) || !seen.add(id)).map(({ id }) => id);
}

export function validateP0QuizData(input: { questions: ScoredQuizQuestion[]; traits: TraitDefinition[]; profiles: CharacterPersonalityProfile[] }) {
  const traits = z.array(traitDefinitionSchema).parse(input.traits);
  const questions = z.array(scoredQuizQuestionSchema).length(36).parse(input.questions);
  const profiles = z.array(characterPersonalityProfileSchema).parse(input.profiles);
  const duplicateTraitIds = duplicateIds(traits);
  const duplicateQuestionIds = duplicateIds(questions);
  const duplicateProfileIds = duplicateIds(profiles);
  const duplicateAnswerIds = questions.flatMap((question) => duplicateIds(question.answers).map((id) => `${question.id}/${id}`));
  const duplicates = [...duplicateTraitIds, ...duplicateQuestionIds, ...duplicateProfileIds, ...duplicateAnswerIds];
  if (duplicates.length) throw new Error(`Duplicate dataset identifiers: ${duplicates.join(", ")}`);
  for (const dimensionId of DIMENSION_IDS) {
    const pool = questions.filter((question) => question.dimensionId === dimensionId);
    if (pool.length < QUESTIONS_PER_DIMENSION) throw new Error(`Dimension ${dimensionId} has ${pool.length} question(s), needs at least ${QUESTIONS_PER_DIMENSION} to select from`);
  }
  return { questions, traits, profiles };
}

export function validateElementProfiles(input: unknown): ElementPersonalityProfile[] {
  const profiles = z.array(elementPersonalityProfileSchema).length(7).parse(input);
  const duplicateElementIds = duplicateIds(profiles.map(({ elementId }) => ({ id: elementId })));
  if (duplicateElementIds.length) throw new Error(`Duplicate element identifiers: ${duplicateElementIds.join(", ")}`);
  for (const profile of profiles) {
    const traitIds = Object.keys(profile.personalityTheme.traits);
    if (!traitIds.includes(profile.personalityTheme.primary)) throw new Error(`${profile.elementId} primary trait is missing from weights`);
    for (const traitId of profile.personalityTheme.secondary) {
      if (!traitIds.includes(traitId)) throw new Error(`${profile.elementId} secondary trait is missing from weights: ${traitId}`);
    }
  }
  return profiles as ElementPersonalityProfile[];
}
