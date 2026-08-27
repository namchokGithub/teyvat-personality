import { customAlphabet } from "nanoid";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type Firestore,
} from "firebase/firestore";

import type {
  CharacterMatch,
  SharedResultCharacterSnapshot,
  SharedResultSnapshot,
  SharedResultVersion,
  SharedResultVisionSnapshot,
  VisionMatch,
} from "../types";
import { withTimeout } from "./timeout";

const SHARED_RESULT_ID_ALPHABET =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-";
const SHARED_RESULT_ID_LENGTH = 12;
const generateSharedResultId = customAlphabet(
  SHARED_RESULT_ID_ALPHABET,
  SHARED_RESULT_ID_LENGTH,
);

export function createSharedResultId(): string {
  return generateSharedResultId();
}

function toCharacterSnapshot(
  character: CharacterMatch,
): SharedResultCharacterSnapshot {
  return {
    characterId: character.characterId,
    name: character.name,
    element: character.element,
    region: character.region,
    compatibility: Math.round(
      Math.min(100, Math.max(0, character.compatibility)),
    ),
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
  additionalCharacters: CharacterMatch[],
  vision: VisionMatch,
  versions: SharedResultVersion,
): SharedResultSnapshot {
  return {
    schemaVersion: 2,
    questionVersion: versions.questionVersion,
    algorithmVersion: versions.algorithmVersion,
    character: toCharacterSnapshot(character),
    additionalCharacters: additionalCharacters
      .slice(0, 3)
      .map(toCharacterSnapshot),
    vision: toVisionSnapshot(vision),
  };
}

const MAX_SHARED_RESULT_ID_ATTEMPTS = 5;
const SHARED_RESULT_WRITE_TIMEOUT_MS = 12_000;

export async function publishSharedResult(
  db: Firestore,
  character: CharacterMatch,
  additionalCharacters: CharacterMatch[],
  vision: VisionMatch,
  versions: SharedResultVersion,
): Promise<string> {
  for (let attempt = 0; attempt < MAX_SHARED_RESULT_ID_ATTEMPTS; attempt += 1) {
    const id = createSharedResultId();
    const ref = doc(db, "sharedResults", id);
    if (
      (
        await withTimeout(
          getDoc(ref),
          SHARED_RESULT_WRITE_TIMEOUT_MS,
          "checking the shared result ID",
        )
      ).exists()
    )
      continue;
    await withTimeout(
      setDoc(ref, {
        ...buildSharedResultDoc(
          character,
          additionalCharacters,
          vision,
          versions,
        ),
        publishedAt: serverTimestamp(),
      }),
      SHARED_RESULT_WRITE_TIMEOUT_MS,
      "publishing the shared result",
    );
    return id;
  }
  throw new Error(
    `Could not generate a unique shared result id after ${MAX_SHARED_RESULT_ID_ATTEMPTS} attempts`,
  );
}
