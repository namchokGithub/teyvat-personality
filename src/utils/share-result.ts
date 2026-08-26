import QRCode from "qrcode";

import type { CharacterMatch, Locale, VisionMatch } from "../types";

const CANVAS_DISPLAY_FONT =
  '"Teyvat ZHCN", "Bree Serif", "Mitr", Georgia, serif';
const CANVAS_TEXT_FONT = '"Prompt", "Noto Sans Thai", Tahoma, sans-serif';

export interface ShareResultPayload {
  title: string;
  text: string;
  url: string;
}

export type SharedResultState = "preview" | "shared" | "invalid";

export interface SharedResultParams {
  characterId: string;
  visionId: string;
  compatibility: number;
  affinity: number;
  traitIds: string[];
}

export function parseSharedResult(search: string): SharedResultParams | null {
  const params = new URLSearchParams(search);
  const characterId = params.get("character");
  const visionId = params.get("vision");
  if (!params.has("compatibility") || !params.has("affinity")) return null;
  const compatibility = Number(params.get("compatibility"));
  const affinity = Number(params.get("affinity"));
  if (
    !characterId ||
    !visionId ||
    !Number.isInteger(compatibility) ||
    compatibility < 0 ||
    compatibility > 100 ||
    !Number.isInteger(affinity) ||
    affinity < 0 ||
    affinity > 100
  )
    return null;
  return {
    characterId,
    visionId,
    compatibility,
    affinity,
    traitIds: (params.get("traits") ?? "").split(",").filter(Boolean),
  };
}

export function validateSharedResult(
  search: string,
  character: CharacterMatch,
  vision: VisionMatch,
): SharedResultState {
  const params = new URLSearchParams(search);
  const characterId = params.get("character");
  const visionId = params.get("vision");
  if (!characterId && !visionId) return "preview";
  if (!characterId || !visionId) return "invalid";
  return characterId === character.characterId &&
    visionId === vision.element.toLowerCase()
    ? "shared"
    : "invalid";
}

export function createResultUrl(
  character: CharacterMatch,
  vision: VisionMatch,
) {
  const base = `${window.location.origin}${window.location.pathname}`;
  const query = new URLSearchParams({
    character: character.characterId,
    vision: vision.element.toLowerCase(),
    compatibility: String(character.compatibility),
    affinity: String(vision.affinity),
    traits: (character.matchingTraitIds ?? []).join(","),
  });
  return `${base}#/result?${query.toString()}`;
}

export function createSharePayload(
  character: CharacterMatch,
  vision: VisionMatch,
  locale: Locale,
  url: string,
): ShareResultPayload {
  const title = `Teyvat Personalities · ${character.name}`;
  const text =
    locale === "th"
      ? `ตัวละครที่สะท้อนตัวตนของฉันคือ ${character.name} (${character.compatibility}%) และ Vision Affinity คือ ${vision.element} (${vision.affinity}%)`
      : `My Teyvat match is ${character.name} (${character.compatibility}%) with ${vision.element} Vision Affinity (${vision.affinity}%).`;
  return { title, text, url };
}

export function createShareQrCode(url: string) {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 256,
    color: { dark: "#252a32", light: "#ffffffff" },
  });
}

export async function copyText(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

export async function downloadShareCard(
  character: CharacterMatch,
  vision: VisionMatch,
  locale: Locale,
  sharedUrl?: string,
) {
  await loadShareCardFonts(character, locale);
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");

  const palette = elementPalette(vision.element);
  const background = context.createLinearGradient(0, 0, 1080, 1080);
  background.addColorStop(0, palette.light);
  background.addColorStop(1, palette.pale);
  context.fillStyle = background;
  context.fillRect(0, 0, 1080, 1080);
  context.fillStyle = "#ffffff";
  context.beginPath();
  context.roundRect(70, 70, 940, 940, 54);
  context.fill();
  const panel = context.createLinearGradient(110, 110, 500, 970);
  panel.addColorStop(0, palette.primary);
  panel.addColorStop(1, palette.deep);
  context.fillStyle = panel;
  context.beginPath();
  context.roundRect(110, 110, 390, 860, 38);
  context.fill();
  context.strokeStyle = "rgba(255,255,255,.25)";
  context.lineWidth = 3;
  context.beginPath();
  context.arc(305, 385, 142, 0, Math.PI * 2);
  context.stroke();
  const artworkDrawn = character.artworkUrl
    ? await drawArtwork(context, character.artworkUrl, 110, 110, 390, 860)
    : false;
  if (!artworkDrawn) {
    context.fillStyle = "#ffffff";
    context.font = `270px ${CANVAS_DISPLAY_FONT}`;
    context.textAlign = "center";
    context.fillText(character.name.charAt(0), 305, 475);
  }
  context.textAlign = "left";
  context.fillStyle = palette.accent;
  context.font = `700 24px ${CANVAS_TEXT_FONT}`;
  context.fillText("TEYVAT PERSONALITIES", 555, 170);
  context.fillStyle = "#252a32";
  context.font = `92px ${CANVAS_DISPLAY_FONT}`;
  context.fillText(character.name, 555, 290);
  context.fillStyle = palette.accent;
  context.font = `600 30px ${CANVAS_TEXT_FONT}`;
  context.fillText(character.title[locale], 555, 345);
  context.fillStyle = palette.deep;
  context.font = `700 72px ${CANVAS_DISPLAY_FONT}`;
  context.fillText(`${character.compatibility}%`, 555, 445);
  context.fillStyle = "#737b88";
  context.font = `500 22px ${CANVAS_TEXT_FONT}`;
  context.fillText("CHARACTER MATCH", 555, 482);
  context.strokeStyle = "#dfe5e8";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(555, 535);
  context.lineTo(930, 535);
  context.stroke();
  context.fillStyle = "#252a32";
  context.font = `48px ${CANVAS_DISPLAY_FONT}`;
  context.fillText(`${vision.element} Vision`, 555, 610);
  context.fillStyle = palette.primary;
  context.font = `700 30px ${CANVAS_DISPLAY_FONT}`;
  context.fillText(`${vision.affinity}% AFFINITY`, 555, 656);
  context.fillStyle = "#737b88";
  context.font = `600 20px ${CANVAS_TEXT_FONT}`;
  drawWrappedText(
    context,
    character.matchingTraits
      .slice(0, 3)
      .map((trait) => trait[locale])
      .join(" · "),
    555,
    720,
    210,
    25,
    2,
  );
  context.fillStyle = "#59616c";
  context.font = `500 18px ${CANVAS_TEXT_FONT}`;
  drawWrappedText(context, character.summary[locale], 555, 775, 210, 26, 6);
  if (sharedUrl) {
    const qrImage = await loadImage(await createShareQrCode(sharedUrl));
    context.fillStyle = "#ffffff";
    context.beginPath();
    context.roundRect(790, 825, 154, 154, 16);
    context.fill();
    context.drawImage(qrImage, 802, 837, 130, 130);
  }
  if (artworkDrawn) {
    context.fillStyle = "#737b88";
    context.font = `14px ${CANVAS_TEXT_FONT}`;
    context.fillText("Genshin Impact artwork © HoYoverse", 555, 1000);
  }

  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (value) =>
        value ? resolve(value) : reject(new Error("PNG export failed")),
      "image/png",
    ),
  );
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `teyvat-personality-${character.characterId}.png`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function loadImage(source: string) {
  const image = new Image();
  image.src = source;
  await image.decode();
  return image;
}

async function loadShareCardFonts(character: CharacterMatch, locale: Locale) {
  if (!document.fonts) return;

  const thaiText = [
    character.title[locale],
    ...character.matchingTraits.slice(0, 3).map((trait) => trait[locale]),
    character.summary[locale],
  ].join(" ");

  await Promise.all([
    document.fonts.load('600 30px "Prompt"', thaiText),
    document.fonts.load('600 20px "Prompt"', thaiText),
    document.fonts.load('500 18px "Prompt"', thaiText),
    document.fonts.load('92px "Teyvat ZHCN"', character.name),
  ]);
  await document.fonts.ready;
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maximumWidth: number,
  lineHeight: number,
  maximumLines: number,
) {
  const segments = Array.from(
    new Intl.Segmenter("th", { granularity: "word" }).segment(text.trim()),
    ({ segment }) => segment,
  );
  const lines: string[] = [];
  let line = "";
  for (const segment of segments) {
    const candidate = `${line}${segment}`;
    if (context.measureText(candidate).width <= maximumWidth) {
      line = candidate;
      continue;
    }
    if (line.trim()) lines.push(line.trimEnd());
    const nextLine = segment.trimStart();
    if (context.measureText(nextLine).width <= maximumWidth) {
      line = nextLine;
      continue;
    }
    line = truncateCanvasText(context, nextLine, maximumWidth);
  }
  if (line && lines.length < maximumLines) lines.push(line);
  lines.slice(0, maximumLines).forEach((value, index) => {
    context.fillText(value, x, y + index * lineHeight);
  });
}

function truncateCanvasText(
  context: CanvasRenderingContext2D,
  text: string,
  maximumWidth: number,
) {
  const ellipsis = "…";
  let truncated = "";
  for (const character of Array.from(text)) {
    if (
      context.measureText(`${truncated}${character}${ellipsis}`).width >
      maximumWidth
    )
      break;
    truncated += character;
  }
  return truncated ? `${truncated}${ellipsis}` : ellipsis;
}

function elementPalette(element: string) {
  const palettes: Record<
    string,
    {
      light: string;
      pale: string;
      primary: string;
      deep: string;
      accent: string;
    }
  > = {
    pyro: {
      light: "#fff0e9",
      pale: "#f9d7c6",
      primary: "#df7651",
      deep: "#a73f36",
      accent: "#b7553d",
    },
    hydro: {
      light: "#eaf7ff",
      pale: "#cfe8f6",
      primary: "#66aecd",
      deep: "#2f719e",
      accent: "#3d86ad",
    },
    anemo: {
      light: "#e7f8f3",
      pale: "#cdebe3",
      primary: "#66b9a8",
      deep: "#347b72",
      accent: "#438d81",
    },
    electro: {
      light: "#f4ecfc",
      pale: "#e4d4f2",
      primary: "#a87aca",
      deep: "#704697",
      accent: "#8355aa",
    },
    dendro: {
      light: "#edf5e2",
      pale: "#dce9c5",
      primary: "#78944a",
      deep: "#547554",
      accent: "#6e853e",
    },
    cryo: {
      light: "#e8f9fb",
      pale: "#caebef",
      primary: "#68bdc9",
      deep: "#287e93",
      accent: "#3b92a4",
    },
    geo: {
      light: "#fbf4df",
      pale: "#f0dfac",
      primary: "#c39c48",
      deep: "#95702d",
      accent: "#a88336",
    },
  };
  return palettes[element.toLowerCase()] ?? palettes.dendro;
}

async function drawArtwork(
  context: CanvasRenderingContext2D,
  url: string,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const image = new Image();
  image.src = url;
  try {
    await image.decode();
  } catch {
    return false;
  }
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  context.save();
  context.beginPath();
  context.roundRect(x, y, width, height, 38);
  context.clip();
  context.drawImage(
    image,
    x + (width - drawWidth) / 2,
    y + (height - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
  context.restore();
  return true;
}
