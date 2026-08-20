import characterIndex from "./characters.json";
import type { CharacterDetail, CharacterSummary } from "../../types";

interface RawCharacter {
  id: string;
  name: string;
  region: string | null;
  element: string | null;
  weapon: string | null;
  rarity: number | null;
  title: string | null;
  titleTh?: string | null;
  description: string | null;
  descriptionTh?: string | null;
}

type CharacterLoader = () => Promise<RawCharacter>;
const modules = import.meta.glob<RawCharacter>(["./*.json", "!./characters.json"], { import: "default" });
const cache = new Map<string, CharacterDetail>();

function normalize(value: RawCharacter): CharacterDetail {
  return {
    id: value.id,
    name: value.name,
    region: value.region,
    element: value.element,
    weapon: value.weapon,
    rarity: value.rarity,
    title: { th: value.titleTh || value.title || "", en: value.title || "" },
    description: { th: value.descriptionTh || value.description || "", en: value.description || "" },
  };
}

export async function loadCharacterById(id: string | undefined) {
  if (!id) return null;
  const cached = cache.get(id);
  if (cached) return cached;
  const loader = modules[`./${id}.json`] as CharacterLoader | undefined;
  if (!loader) return null;
  const value = await loader();
  if (!value || Array.isArray(value) || value.id !== id) return null;
  const character = normalize(value);
  cache.set(id, character);
  return character;
}

export function getCharacterIndex() {
  return characterIndex as Array<{ id: string; name: string }>;
}

export async function loadCharacterSummaries(): Promise<CharacterSummary[]> {
  const values = await Promise.all(characterIndex.map(({ id }) => loadCharacterById(id)));
  return values.filter((value): value is CharacterDetail => Boolean(value)).map(({ id, name, region, element, rarity }) => ({ id, name, region, element, rarity }));
}
