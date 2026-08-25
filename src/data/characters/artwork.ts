import characterIndex from "./_characters.json";
import type { CSSProperties } from "react";
import type {
  CharacterArtwork,
  CharacterArtworkFraming,
  LocalizedText,
} from "../../types";

export const DEFAULT_ARTWORK_FRAMING: CharacterArtworkFraming = {
  x: 50,
  y: 25,
  mobileZoom: 1,
};

// Generated from the current full-artwork dimensions. Files with a
// width/height ratio below 0.9 use a top-biased crop; square and landscape
// artwork use the centered upper-half default above.
const portraitArtworkIds = new Set([
  "albedo",
  "alhaitham",
  "aloy",
  "amber",
  "arataki_itto",
  "baizhu",
  "barbara",
  "beidou",
  "bennett",
  "chongyun",
  "collei",
  "dehya",
  "diluc",
  "diona",
  "dori",
  "eula",
  "faruzan",
  "fischl",
  "ganyu",
  "gorou",
  "hu_tao",
  "jean",
  "kaedehara_kazuha",
  "kaeya",
  "kamisato_ayaka",
  "kamisato_ayato",
  "kaveh",
  "keqing",
  "klee",
  "kujou_sara",
  "kuki_shinobu",
  "layla",
  "lisa",
  "lynette",
  "lyney",
  "mika",
  "mona",
  "nahida",
  "nilou",
  "ningguang",
  "noelle",
  "qiqi",
  "raiden_shogun",
  "rosaria",
  "sangonomiya_kokomi",
  "sayu",
  "shenhe",
  "sucrose",
  "tartaglia",
  "tighnari",
  "traveler_dendro",
  "traveler_geo",
  "traveler_pyro",
  "venti",
  "xiangling",
  "xiao",
  "xingqiu",
  "xinyan",
  "yae_miko",
  "yanfei",
  "yaoyao",
  "yelan",
  "yoimiya",
  "yun_jin",
  "zhongli",
]);

// Add character-specific framing here. Any omitted value falls back to the
// generated orientation preset and then the default above, so an override may
// contain only the value that needs tuning.
const artworkFramingOverrides: Partial<
  Record<string, Partial<CharacterArtworkFraming>>
> = {};

type ArtworkFramingStyle = CSSProperties & {
  "--artwork-focus-x": string;
  "--artwork-focus-y": string;
  "--artwork-mobile-zoom": number;
};

const headArtworkModules = import.meta.glob<string>(
  "../../assets/images/characters/*.png",
  {
    eager: true,
    import: "default",
    query: "?url",
  },
);

const fullArtworkModules = import.meta.glob<string>(
  "../../assets/images/characters/full/*.png",
  {
    eager: true,
    import: "default",
    query: "?url",
  },
);

const paimonMoeSourceRoot =
  "https://github.com/MadeBaruna/paimon-moe/tree/main/static/images/characters";
const paimonMoeUsage =
  "Paimon.moe is MIT-licensed; Genshin Impact game materials remain copyrighted by HoYoverse. Project policy permits non-commercial in-app display and generated Share Cards with this project's attribution and disclaimer. Do not relicense or redistribute the image as a standalone asset.";
const maintainerAssetSource =
  "Project maintainer-provided asset (added 2026-08-21; original source recorded by the project maintainer).";
const maintainerAssetUsage =
  "Approved by the project maintainer for non-commercial in-app display and generated Share Cards. This record does not transfer any third-party copyright.";

function artworkAlt(name: string, variant: "head" | "full"): LocalizedText {
  const thVariant = variant === "head" ? "ภาพศีรษะ" : "ภาพเต็มตัว";
  const enVariant =
    variant === "head" ? "head portrait" : "full character artwork";

  return {
    th: `${thVariant}ของ ${name}`,
    en: `${name} ${enVariant}`,
  };
}

function moduleUrl(modules: Record<string, string>, path: string) {
  return modules[path];
}

const clamp = (value: number, minimum: number, maximum: number) =>
  Math.min(maximum, Math.max(minimum, value));

export function getCharacterArtworkFraming(
  characterId: string,
): CharacterArtworkFraming {
  const inferredY = portraitArtworkIds.has(characterId)
    ? 0
    : DEFAULT_ARTWORK_FRAMING.y;
  const override = artworkFramingOverrides[characterId];
  return {
    x: clamp(override?.x ?? DEFAULT_ARTWORK_FRAMING.x, 0, 100),
    y: clamp(override?.y ?? inferredY, 0, 100),
    mobileZoom: clamp(
      override?.mobileZoom ?? DEFAULT_ARTWORK_FRAMING.mobileZoom,
      1,
      2,
    ),
  };
}

export function getCharacterArtworkFramingStyle(
  characterId: string,
): ArtworkFramingStyle {
  const framing = getCharacterArtworkFraming(characterId);
  return {
    "--artwork-focus-x": `${framing.x}%`,
    "--artwork-focus-y": `${framing.y}%`,
    "--artwork-mobile-zoom": framing.mobileZoom,
  };
}

function createArtwork(
  characterId: string,
  name: string,
  variant: "head" | "full",
  url: string,
): CharacterArtwork {
  const isMaintainerAsset = characterId === "traveler_cryo";
  const sourcePath =
    variant === "head" ? `${characterId}.png` : `full/${characterId}.png`;

  return {
    characterId,
    variant,
    url,
    alt: artworkAlt(name, variant),
    framing: getCharacterArtworkFraming(characterId),
    source: isMaintainerAsset
      ? maintainerAssetSource
      : `${paimonMoeSourceRoot}/${sourcePath}`,
    licenseOrUsageNote: isMaintainerAsset
      ? maintainerAssetUsage
      : paimonMoeUsage,
    usage: "ui-and-share-card",
  };
}

export const characterArtworkManifest: CharacterArtwork[] =
  characterIndex.flatMap(({ id, name }) => {
    const head = moduleUrl(
      headArtworkModules,
      `../../assets/images/characters/${id}.png`,
    );
    const full = moduleUrl(
      fullArtworkModules,
      `../../assets/images/characters/full/${id}.png`,
    );

    return [
      ...(head ? [createArtwork(id, name, "head", head)] : []),
      ...(full ? [createArtwork(id, name, "full", full)] : []),
    ];
  });

export function getCharacterArtwork(
  characterId: string,
  variant: "head" | "full",
) {
  return (
    characterArtworkManifest.find(
      (artwork) =>
        artwork.characterId === characterId && artwork.variant === variant,
    ) ?? null
  );
}
