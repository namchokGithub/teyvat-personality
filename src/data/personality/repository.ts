import type { CharacterPersonalityProfile } from "../../types";
import { characterPersonalityProfileSchema } from "../../schemas";
import { getCharacterIndex } from "../characters/repository";

const cache = new Map<string, CharacterPersonalityProfile>();

async function resolveProfile(
  id: string,
  rawById: Map<string, unknown>,
): Promise<CharacterPersonalityProfile | null> {
  const cached = cache.get(id);
  if (cached) return cached;
  const raw = rawById.get(id);
  if (!raw) return null;
  const profile = characterPersonalityProfileSchema.parse(
    raw,
  ) as CharacterPersonalityProfile;
  if (profile.id !== id) return null;
  cache.set(id, profile);
  return profile;
}

export async function loadCharacterPersonalityById(id: string | undefined) {
  if (!id) return null;
  const { rawCharacterPersonalitiesById } =
    await import("./character-personalities-bundle");
  return resolveProfile(id, rawCharacterPersonalitiesById);
}

export async function loadAllCharacterPersonalities() {
  const { rawCharacterPersonalitiesById } =
    await import("./character-personalities-bundle");
  const profiles = await Promise.all(
    getCharacterIndex().map(({ id }) =>
      resolveProfile(id, rawCharacterPersonalitiesById),
    ),
  );
  return profiles.filter((profile): profile is CharacterPersonalityProfile =>
    Boolean(profile),
  );
}
