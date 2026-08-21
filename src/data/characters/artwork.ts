import characterIndex from "./_characters.json";
import type { CharacterArtwork, LocalizedText } from "../../types";

const headArtworkModules = import.meta.glob<string>("../../assets/images/characters/*.png", {
  eager: true,
  import: "default",
  query: "?url",
});

const fullArtworkModules = import.meta.glob<string>("../../assets/images/characters/full/*.png", {
  eager: true,
  import: "default",
  query: "?url",
});

const projectLocalSource = "Project-local artwork asset; original source/provenance pending verification.";
const restrictedUsage = "License has not been verified. Do not publish, redistribute, or use in Share Card export until provenance and permission are recorded.";

function artworkAlt(name: string, variant: "head" | "full"): LocalizedText {
  const thVariant = variant === "head" ? "ภาพศีรษะ" : "ภาพเต็มตัว";
  const enVariant = variant === "head" ? "head portrait" : "full character artwork";

  return {
    th: `${thVariant}ของ ${name}`,
    en: `${name} ${enVariant}`,
  };
}

function moduleUrl(modules: Record<string, string>, path: string) {
  return modules[path];
}

function createArtwork(characterId: string, name: string, variant: "head" | "full", url: string): CharacterArtwork {
  return {
    characterId,
    variant,
    url,
    alt: artworkAlt(name, variant),
    source: projectLocalSource,
    licenseOrUsageNote: restrictedUsage,
  };
}

export const characterArtworkManifest: CharacterArtwork[] = characterIndex.flatMap(({ id, name }) => {
  const head = moduleUrl(headArtworkModules, `../../assets/images/characters/${id}.png`);
  const full = moduleUrl(fullArtworkModules, `../../assets/images/characters/full/${id}.png`);

  return [
    ...(head ? [createArtwork(id, name, "head", head)] : []),
    ...(full ? [createArtwork(id, name, "full", full)] : []),
  ];
});

export function getCharacterArtwork(characterId: string, variant: "head" | "full") {
  return characterArtworkManifest.find((artwork) => artwork.characterId === characterId && artwork.variant === variant) ?? null;
}
