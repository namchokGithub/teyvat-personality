import { customAlphabet } from "nanoid";

import type {
  CharacterMatch,
  SharedResultCharacterSnapshot,
  SharedResultSnapshot,
  SharedResultVersion,
  SharedResultVisionSnapshot,
  VisionMatch,
} from "../types";

const SHARED_RESULT_ID_ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-";
const SHARED_RESULT_ID_LENGTH = 12;
const generateSharedResultId = customAlphabet(SHARED_RESULT_ID_ALPHABET, SHARED_RESULT_ID_LENGTH);

export function createSharedResultId(): string {
  return generateSharedResultId();
}

function toCharacterSnapshot(character: CharacterMatch): SharedResultCharacterSnapshot {
  return {
    characterId: character.characterId,
    name: character.name,
    element: character.element,
    region: character.region,
    compatibility: Math.round(character.compatibility),
    title: character.title,
    summary: character.summary,
    matchingTraits: character.matchingTraits,
    artworkUrl: character.artworkUrl ?? null,
  };
}

function toVisionSnapshot(vision: VisionMatch): SharedResultVisionSnapshot {
  return {
    element: vision.element,
    affinity: Math.round(vision.affinity),
    summary: vision.summary,
  };
}

export function buildSharedResultDoc(
  character: CharacterMatch,
  vision: VisionMatch,
  versions: SharedResultVersion,
): SharedResultSnapshot {
  return {
    schemaVersion: 1,
    questionVersion: versions.questionVersion,
    algorithmVersion: versions.algorithmVersion,
    character: toCharacterSnapshot(character),
    vision: toVisionSnapshot(vision),
  };
}
