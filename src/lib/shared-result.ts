import { customAlphabet } from "nanoid";
import { doc, getDoc, serverTimestamp, setDoc, type Firestore } from "firebase/firestore";

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
    compatibility: Math.round(Math.min(100, Math.max(0, character.compatibility))),
    title: character.title,
    summary: character.summary,
    matchingTraits: character.matchingTraits,
    artworkUrl: character.artworkUrl ?? null,
  };
}

function toVisionSnapshot(vision: VisionMatch): SharedResultVisionSnapshot {
  return {
    element: vision.element,
    affinity: Math.round(Math.min(100, Math.max(0, vision.affinity))),
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

const MAX_SHARED_RESULT_ID_ATTEMPTS = 5;

export async function publishSharedResult(
  db: Firestore,
  character: CharacterMatch,
  vision: VisionMatch,
  versions: SharedResultVersion,
): Promise<string> {
  for (let attempt = 0; attempt < MAX_SHARED_RESULT_ID_ATTEMPTS; attempt += 1) {
    const id = createSharedResultId();
    const ref = doc(db, "sharedResults", id);
    if ((await getDoc(ref)).exists()) continue;
    await setDoc(ref, { ...buildSharedResultDoc(character, vision, versions), publishedAt: serverTimestamp() });
    return id;
  }
  throw new Error(`Could not generate a unique shared result id after ${MAX_SHARED_RESULT_ID_ATTEMPTS} attempts`);
}
