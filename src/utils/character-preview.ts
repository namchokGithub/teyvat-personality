import { getCharacterArtwork } from "../data/characters/artwork";
import { visionInterpretations } from "../data/personality/result-interpretations";
import type { CharacterDetail, CharacterMatch, VisionMatch } from "../types";

export function createCharacterResultPreview(
  character: CharacterDetail,
): { character: CharacterMatch; vision: VisionMatch } | null {
  const element = character.element;
  if (!element) return null;

  const interpretation = visionInterpretations[element.toLowerCase()];
  if (!interpretation) return null;

  const artwork = getCharacterArtwork(character.id, "full");
  return {
    character: {
      characterId: character.id,
      name: character.name,
      element,
      region: character.region ?? "Unknown",
      compatibility: 92,
      title: character.title,
      summary: character.description,
      matchingTraits: [],
      artworkUrl: artwork?.url,
    },
    vision: {
      element,
      affinity: 88,
      summary: interpretation.summary,
    },
  };
}
