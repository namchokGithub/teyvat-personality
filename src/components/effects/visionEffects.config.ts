export type VisionElement =
  | "pyro"
  | "cryo"
  | "electro"
  | "hydro"
  | "anemo"
  | "geo"
  | "dendro";

export const VISION_EFFECT_DEFAULT: VisionElement = "cryo";

export const VISION_ELEMENTS: readonly VisionElement[] = [
  "pyro",
  "hydro",
  "anemo",
  "electro",
  "dendro",
  "geo",
  "cryo",
];

export const visionElementLabels: Record<VisionElement, string> = {
  pyro: "Pyro",
  hydro: "Hydro",
  anemo: "Anemo",
  electro: "Electro",
  dendro: "Dendro",
  geo: "Geo",
  cryo: "Cryo",
};

export const visionParticleCounts: Record<
  VisionElement,
  { desktop: number; mobile: number }
> = {
  cryo: { desktop: 52, mobile: 24 },
  dendro: { desktop: 46, mobile: 22 },
  pyro: { desktop: 48, mobile: 24 },
  electro: { desktop: 40, mobile: 20 },
  hydro: { desktop: 44, mobile: 22 },
  anemo: { desktop: 42, mobile: 20 },
  geo: { desktop: 40, mobile: 20 },
};

export function isVisionElement(
  value: string | null,
): value is VisionElement {
  return value !== null && (VISION_ELEMENTS as readonly string[]).includes(value);
}
