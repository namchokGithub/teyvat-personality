import type { CharacterPersonalityProfile } from "../../types";
import { characterPersonalityProfileSchema } from "../../schemas";
import { getCharacterIndex } from "../characters/repository";

type ProfileLoader = () => Promise<unknown>;
const modules = import.meta.glob([
  "./character-personalities/*.json",
  "!./character-personalities/_*.json",
], { import: "default" });
const cache = new Map<string, CharacterPersonalityProfile>();

export async function loadCharacterPersonalityById(id: string | undefined) {
  if (!id) return null;
  const cached = cache.get(id);
  if (cached) return cached;
  const loader = modules[`./character-personalities/${id}.json`] as ProfileLoader | undefined;
  if (!loader) return null;
  const raw = await loader();
  const profile = characterPersonalityProfileSchema.parse(raw) as CharacterPersonalityProfile;
  if (profile.id !== id) return null;
  cache.set(id, profile);
  return profile;
}

export async function loadAllCharacterPersonalities() {
  const profiles = await Promise.all(getCharacterIndex().map(({ id }) => loadCharacterPersonalityById(id)));
  return profiles.filter((profile): profile is CharacterPersonalityProfile => Boolean(profile));
}
