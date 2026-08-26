import { getCharacterArtwork } from "../characters/artwork";
import { loadCharacterById } from "../characters/repository";
import { questionById } from "../quiz";
import {
  ALGORITHM_VERSION,
  buildUserPersonalityProfile,
  QUESTION_VERSION,
  rankCharacterMatches,
  rankVisionAffinities,
} from "../../engine";
import {
  MatchingError,
  type MatchingErrorCategory,
} from "../../lib/matching-errors";
import type {
  CharacterMatch,
  CharacterPersonalityProfile,
  DimensionId,
  LocalizedText,
  QuizResult,
  TraitId,
  UserPersonalityProfile,
  VisionMatch,
} from "../../types";
import { TRAIT_IDS } from "../../types";
import type { SharedResultParams } from "../../utils/share-result";
import { elementProfiles } from "./element-profiles";
import { loadAllCharacterPersonalities } from "./repository";
import {
  resultTitleByDimension,
  traitNarratives,
  visionInterpretations,
} from "./result-interpretations";
import { traitById } from "./traits";

function dominantDimension(dimensions: Record<DimensionId, number>) {
  return (Object.entries(dimensions) as Array<[DimensionId, number]>).sort(
    (left, right) =>
      Math.abs(right[1] - 50) - Math.abs(left[1] - 50) ||
      left[0].localeCompare(right[0]),
  )[0][0];
}

function traitLabels(ids: TraitId[]): LocalizedText[] {
  return ids
    .map((id) => traitById.get(id)?.label)
    .filter((label): label is LocalizedText => Boolean(label));
}

function characterSummary(
  name: string,
  matchingTraitIds: TraitId[],
): LocalizedText {
  const narratives = matchingTraitIds
    .slice(0, 2)
    .map((traitId) => traitNarratives[traitId]);
  if (!narratives.length) {
    return {
      th: `รูปแบบการตัดสินใจและการใช้ชีวิตของคุณมีความใกล้เคียงกับ ${name} มากที่สุด`,
      en: `Your approach to decisions and daily life is closest to ${name}.`,
    };
  }
  if (narratives.length === 1) {
    return {
      th: `บนเส้นทางที่คล้ายกัน คุณและ ${name} ต่าง${narratives[0].lead.th}`,
      en: `On similar paths, you and ${name} both ${narratives[0].lead.en}.`,
    };
  }
  return {
    th: `บนเส้นทางที่คล้ายกัน คุณและ ${name} ต่าง${narratives[0].lead.th} พร้อมทั้ง${narratives[1].follow.th}`,
    en: `On similar paths, you and ${name} both ${narratives[0].lead.en}, while also ${narratives[1].follow.en}.`,
  };
}

async function runMatchingStage<T>(
  category: MatchingErrorCategory,
  message: string,
  run: () => T | Promise<T>,
): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (error instanceof MatchingError) throw error;
    throw new MatchingError(category, message, { cause: error });
  }
}

export async function calculateQuizResult(
  answers: Record<string, string>,
): Promise<QuizResult> {
  const answeredQuestions = Object.keys(answers).map((id) =>
    questionById.get(id)!,
  );

  const profile = await runMatchingStage<UserPersonalityProfile>(
    "navigation",
    "Quiz progress does not match the current question set",
    () => buildUserPersonalityProfile(answers, answeredQuestions),
  );

  const personalities = await runMatchingStage<CharacterPersonalityProfile[]>(
    "data-load",
    "Failed to load character personality data",
    () => loadAllCharacterPersonalities(),
  );

  const rankedCharacters = await runMatchingStage(
    "calculation",
    "Failed to rank character matches",
    () => rankCharacterMatches(profile, personalities).slice(0, 4),
  );
  const rankedVisions = await runMatchingStage(
    "calculation",
    "Failed to rank vision affinities",
    () => rankVisionAffinities(profile, elementProfiles),
  );
  const title = resultTitleByDimension[dominantDimension(profile.dimensions)];

  const characterMatches = await runMatchingStage<CharacterMatch[]>(
    "data-load",
    "Failed to load character details",
    async () =>
      (
        await Promise.all(
          rankedCharacters.map(
            async (score): Promise<CharacterMatch | null> => {
              const character = await loadCharacterById(score.characterId);
              if (!character) return null;
              const labels = traitLabels(score.matchingTraitIds);
              return {
                characterId: character.id,
                name: character.name,
                element: character.element ?? "Unknown",
                region: character.region ?? "Unknown",
                compatibility: score.compatibility,
                title,
                summary: characterSummary(
                  character.name,
                  score.matchingTraitIds,
                ),
                matchingTraits: labels,
                matchingTraitIds: score.matchingTraitIds,
                artworkUrl: getCharacterArtwork(character.id, "full")?.url,
              };
            },
          ),
        )
      ).filter((match): match is CharacterMatch => Boolean(match)),
  );

  const visionMatches: VisionMatch[] = rankedVisions.map((score) => ({
    element: score.elementId.charAt(0).toUpperCase() + score.elementId.slice(1),
    affinity: score.affinity,
    summary: visionInterpretations[score.elementId]?.summary ?? {
      th: "ผลลัพธ์นี้เป็นการตีความแบบแฟนเมด",
      en: "This result is a fan-made interpretation.",
    },
  }));

  if (!characterMatches.length)
    throw new MatchingError(
      "calculation",
      "No character matches are available",
    );
  return {
    version: 1,
    questionVersion: QUESTION_VERSION,
    algorithmVersion: ALGORITHM_VERSION,
    profile,
    characterMatches,
    visionMatches,
    completedAt: new Date().toISOString(),
  };
}

export async function loadSharedQuizResult(
  params: SharedResultParams,
): Promise<QuizResult | null> {
  const character = await loadCharacterById(params.characterId);
  const personality = await (
    await import("./repository")
  ).loadCharacterPersonalityById(params.characterId);
  const vision = visionInterpretations[params.visionId];
  if (
    !character ||
    !personality ||
    !vision ||
    !elementProfiles.some(({ elementId }) => elementId === params.visionId)
  )
    return null;
  const validTraitIds = params.traitIds
    .filter((id): id is TraitId =>
      (TRAIT_IDS as readonly string[]).includes(id),
    )
    .slice(0, 3);
  const labels = traitLabels(validTraitIds);
  const primaryCharacter: CharacterMatch = {
    characterId: character.id,
    name: character.name,
    element: character.element ?? "Unknown",
    region: character.region ?? "Unknown",
    compatibility: params.compatibility,
    title: resultTitleByDimension[dominantDimension(personality.personality)],
    summary: characterSummary(character.name, validTraitIds),
    matchingTraits: labels,
    matchingTraitIds: validTraitIds,
    artworkUrl: getCharacterArtwork(character.id, "full")?.url,
  };
  return {
    version: 1,
    questionVersion: QUESTION_VERSION,
    algorithmVersion: ALGORITHM_VERSION,
    profile: {
      dimensions: personality.personality,
      traits: Object.fromEntries(
        TRAIT_IDS.map((id) => [id, personality.traits[id] ?? 0]),
      ) as Record<TraitId, number>,
    },
    characterMatches: [primaryCharacter],
    visionMatches: [
      {
        element:
          params.visionId.charAt(0).toUpperCase() + params.visionId.slice(1),
        affinity: params.affinity,
        summary: vision.summary,
      },
    ],
    completedAt: "",
  };
}
