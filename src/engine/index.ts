import {
  DIMENSION_IDS,
  TRAIT_IDS,
  type CharacterMatchScore,
  type CharacterPersonalityProfile,
  type DimensionId,
  type ElementPersonalityProfile,
  type ScoredQuizQuestion,
  type TraitId,
  type UserPersonalityProfile,
  type VisionMatchScore,
} from "../types";

export const QUESTION_VERSION = "2026-08-25-rpg-2";
export const ALGORITHM_VERSION = "1.0.0";
export const QUESTIONS_PER_DIMENSION = 4;

const clamp = (value: number, minimum: number, maximum: number) => Math.min(maximum, Math.max(minimum, value));
const round = (value: number, precision = 4) => Number(value.toFixed(precision));

function selectedAnswers(answers: Record<string, string>, questions: ScoredQuizQuestion[]) {
  if (Object.keys(answers).length !== questions.length) throw new Error("Quiz answers are incomplete");
  return questions.map((question) => {
    const answerId = answers[question.id];
    const answer = question.answers.find((candidate) => candidate.id === answerId);
    if (!answer) throw new Error(`Invalid answer for ${question.id}: ${answerId ?? "missing"}`);
    return answer;
  });
}

export function buildUserPersonalityProfile(
  answers: Record<string, string>,
  questions: ScoredQuizQuestion[],
): UserPersonalityProfile {
  const selected = selectedAnswers(answers, questions);
  const dimensions = {} as Record<DimensionId, number>;
  const traits = {} as Record<TraitId, number>;

  for (const dimensionId of DIMENSION_IDS) {
    const raw = selected.reduce((sum, answer) => sum + (answer.scores.dimensions[dimensionId] ?? 0), 0);
    const minimum = questions.reduce((sum, question) => Math.min(...question.answers.map((answer) => answer.scores.dimensions[dimensionId] ?? 0)) + sum, 0);
    const maximum = questions.reduce((sum, question) => Math.max(...question.answers.map((answer) => answer.scores.dimensions[dimensionId] ?? 0)) + sum, 0);
    if (minimum === maximum) throw new Error(`Dimension has no scoring range: ${dimensionId}`);
    dimensions[dimensionId] = Math.round(clamp(((raw - minimum) / (maximum - minimum)) * 100, 0, 100));
  }

  for (const traitId of TRAIT_IDS) {
    const raw = selected.reduce((sum, answer) => sum + (answer.scores.traits[traitId] ?? 0), 0);
    const maximum = questions.reduce((sum, question) => Math.max(...question.answers.map((answer) => answer.scores.traits[traitId] ?? 0)) + sum, 0);
    traits[traitId] = maximum > 0 ? round(clamp(raw / maximum, 0, 1)) : 0;
  }

  return { dimensions, traits };
}

export function rankCharacterMatches(
  user: UserPersonalityProfile,
  characters: CharacterPersonalityProfile[],
): CharacterMatchScore[] {
  return characters.map((character) => {
    const dimensionSimilarity = 1 - DIMENSION_IDS.reduce(
      (sum, dimensionId) => sum + Math.abs(user.dimensions[dimensionId] - character.personality[dimensionId]) / 100,
      0,
    ) / DIMENSION_IDS.length;
    const characterTraits = Object.entries(character.traits) as Array<[TraitId, number]>;
    const totalWeight = characterTraits.reduce((sum, [, weight]) => sum + weight, 0);
    const traitSimilarity = totalWeight > 0
      ? characterTraits.reduce((sum, [traitId, weight]) => sum + (1 - Math.abs(user.traits[traitId] - weight)) * weight, 0) / totalWeight
      : 0;
    const coverageFactor = Math.min(characterTraits.length / 5, 1);
    const adjustedTraitSimilarity = traitSimilarity * (0.85 + 0.15 * coverageFactor);
    const rawSimilarity = dimensionSimilarity * 0.7 + adjustedTraitSimilarity * 0.3;
    let matchingTraitIds = characterTraits
      .filter(([traitId, weight]) => user.traits[traitId] >= 0.5 && weight >= 0.5 && 1 - Math.abs(user.traits[traitId] - weight) >= 0.75)
      .sort((left, right) => {
        const leftMatch = 1 - Math.abs(user.traits[left[0]] - left[1]);
        const rightMatch = 1 - Math.abs(user.traits[right[0]] - right[1]);
        return rightMatch - leftMatch || right[1] - left[1] || left[0].localeCompare(right[0]);
      })
      .slice(0, 3)
      .map(([traitId]) => traitId);
    if (!matchingTraitIds.length && characterTraits.length) {
      matchingTraitIds = [...characterTraits]
        .sort((left, right) => {
          const leftMatch = 1 - Math.abs(user.traits[left[0]] - left[1]);
          const rightMatch = 1 - Math.abs(user.traits[right[0]] - right[1]);
          return rightMatch - leftMatch || right[1] - left[1] || left[0].localeCompare(right[0]);
        })
        .slice(0, 1)
        .map(([traitId]) => traitId);
    }
    return {
      characterId: character.id,
      compatibility: Math.round(clamp(rawSimilarity * 100, 0, 100)),
      rawSimilarity: round(rawSimilarity, 8),
      dimensionSimilarity: round(dimensionSimilarity, 8),
      traitSimilarity: round(adjustedTraitSimilarity, 8),
      matchingTraitIds,
    };
  }).sort((left, right) =>
    right.rawSimilarity - left.rawSimilarity ||
    right.dimensionSimilarity - left.dimensionSimilarity ||
    right.traitSimilarity - left.traitSimilarity ||
    right.matchingTraitIds.length - left.matchingTraitIds.length ||
    left.characterId.localeCompare(right.characterId),
  );
}

export function rankVisionAffinities(
  user: UserPersonalityProfile,
  elements: ElementPersonalityProfile[],
): VisionMatchScore[] {
  return elements.map((element) => {
    const weightedTraits = Object.entries(element.personalityTheme.traits) as Array<[TraitId, number]>;
    const totalWeight = weightedTraits.reduce((sum, [, weight]) => sum + weight, 0);
    if (totalWeight <= 0) throw new Error(`Element has no positive trait weights: ${element.elementId}`);
    const weightedAffinity = weightedTraits.reduce((sum, [traitId, weight]) => sum + user.traits[traitId] * weight, 0) / totalWeight;
    const primaryTraitScore = user.traits[element.personalityTheme.primary];
    const rawAffinity = weightedAffinity * (0.85 + primaryTraitScore * 0.15);
    return {
      elementId: element.elementId,
      affinity: Math.round(clamp(rawAffinity * 100, 0, 100)),
      rawAffinity: round(rawAffinity, 8),
      primaryTraitScore,
    };
  }).sort((left, right) =>
    right.rawAffinity - left.rawAffinity ||
    right.primaryTraitScore - left.primaryTraitScore ||
    left.elementId.localeCompare(right.elementId),
  );
}
