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

const paimonMoeSourceRoot = "https://github.com/MadeBaruna/paimon-moe/tree/main/static/images/characters";
const paimonMoeUsage = "Paimon.moe is MIT-licensed; Genshin Impact game materials remain copyrighted by HoYoverse. Project policy permits non-commercial in-app display and generated Share Cards with this project's attribution and disclaimer. Do not relicense or redistribute the image as a standalone asset.";
const maintainerAssetSource = "Project maintainer-provided asset (added 2026-08-21; original source recorded by the project maintainer).";
const maintainerAssetUsage = "Approved by the project maintainer for non-commercial in-app display and generated Share Cards. This record does not transfer any third-party copyright.";

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
  const isMaintainerAsset = characterId === "traveler_cryo";
  const sourcePath = variant === "head" ? `${characterId}.png` : `full/${characterId}.png`;

  return {
    characterId,
    variant,
    url,
    alt: artworkAlt(name, variant),
    source: isMaintainerAsset ? maintainerAssetSource : `${paimonMoeSourceRoot}/${sourcePath}`,
    licenseOrUsageNote: isMaintainerAsset ? maintainerAssetUsage : paimonMoeUsage,
    usage: "ui-and-share-card",
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
