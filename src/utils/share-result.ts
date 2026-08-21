import type { CharacterMatch, Locale, VisionMatch } from "../types";

export interface ShareResultPayload {
  title: string;
  text: string;
  url: string;
}

export type SharedResultState = "preview" | "shared" | "invalid";

export function validateSharedResult(search: string, character: CharacterMatch, vision: VisionMatch): SharedResultState {
  const params = new URLSearchParams(search);
  const characterId = params.get("character");
  const visionId = params.get("vision");
  if (!characterId && !visionId) return "preview";
  if (!characterId || !visionId) return "invalid";
  return characterId === character.characterId && visionId === vision.element.toLowerCase() ? "shared" : "invalid";
}

export function createResultUrl(character: CharacterMatch, vision: VisionMatch) {
  const base = `${window.location.origin}${window.location.pathname}`;
  const query = new URLSearchParams({ character: character.characterId, vision: vision.element.toLowerCase() });
  return `${base}#/result?${query.toString()}`;
}

export function createSharePayload(character: CharacterMatch, vision: VisionMatch, locale: Locale): ShareResultPayload {
  const title = `Teyvat Personalities · ${character.name}`;
  const text = locale === "th"
    ? `ตัวละครที่สะท้อนตัวตนของฉันคือ ${character.name} (${character.compatibility}%) และ Vision Affinity คือ ${vision.element} (${vision.affinity}%)`
    : `My Teyvat match is ${character.name} (${character.compatibility}%) with ${vision.element} Vision Affinity (${vision.affinity}%).`;
  return { title, text, url: createResultUrl(character, vision) };
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

export async function downloadShareCard(character: CharacterMatch, vision: VisionMatch, locale: Locale) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");

  const background = context.createLinearGradient(0, 0, 1080, 1080);
  background.addColorStop(0, "#edf4ee"); background.addColorStop(1, "#dce7ef");
  context.fillStyle = background; context.fillRect(0, 0, 1080, 1080);
  context.fillStyle = "#ffffff"; context.beginPath(); context.roundRect(70, 70, 940, 940, 54); context.fill();
  const panel = context.createLinearGradient(110, 110, 500, 970);
  panel.addColorStop(0, "#76976d"); panel.addColorStop(1, "#365a58");
  context.fillStyle = panel; context.beginPath(); context.roundRect(110, 110, 390, 860, 38); context.fill();
  context.strokeStyle = "rgba(255,255,255,.25)"; context.lineWidth = 3; context.beginPath(); context.arc(305, 385, 142, 0, Math.PI * 2); context.stroke();
  const artworkDrawn = character.artworkUrl ? await drawArtwork(context, character.artworkUrl, 110, 110, 390, 860) : false;
  if (!artworkDrawn) { context.fillStyle = "#ffffff"; context.font = "270px Georgia, serif"; context.textAlign = "center"; context.fillText(character.name.charAt(0), 305, 475); }
  context.textAlign = "left"; context.fillStyle = "#b49454"; context.font = "700 24px Arial, sans-serif"; context.fillText("TEYVAT PERSONALITIES", 555, 170);
  context.fillStyle = "#252a32"; context.font = "92px Georgia, serif"; context.fillText(character.name, 555, 290, 400);
  context.fillStyle = "#b49454"; context.font = '30px "Noto Sans Thai", Arial, sans-serif'; context.fillText(character.title[locale], 555, 345, 400);
  context.fillStyle = "#3e5778"; context.font = "700 72px Arial, sans-serif"; context.fillText(`${character.compatibility}%`, 555, 445);
  context.fillStyle = "#737b88"; context.font = "22px Arial, sans-serif"; context.fillText("CHARACTER MATCH", 555, 482);
  context.strokeStyle = "#dfe5e8"; context.lineWidth = 2; context.beginPath(); context.moveTo(555, 535); context.lineTo(930, 535); context.stroke();
  context.fillStyle = "#252a32"; context.font = "48px Georgia, serif"; context.fillText(`${vision.element} Vision`, 555, 610, 400);
  context.fillStyle = "#78944a"; context.font = "700 30px Arial, sans-serif"; context.fillText(`${vision.affinity}% AFFINITY`, 555, 656);
  context.fillStyle = "#737b88"; context.font = '23px "Noto Sans Thai", Arial, sans-serif'; context.fillText(character.matchingTraits.slice(0, 3).map((trait) => trait[locale]).join(" · "), 555, 755, 400);
  context.font = "20px Arial, sans-serif"; context.fillText("teyvat-personality · fan project", 555, 900);
  if (artworkDrawn) context.fillText("Genshin Impact artwork © HoYoverse", 555, 935);

  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("PNG export failed")), "image/png"));
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `teyvat-personality-${character.characterId}.png`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

async function drawArtwork(context: CanvasRenderingContext2D, url: string, x: number, y: number, width: number, height: number) {
  const image = new Image();
  image.src = url;
  try { await image.decode(); } catch { return false; }
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  context.save(); context.beginPath(); context.roundRect(x, y, width, height, 38); context.clip(); context.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight); context.restore();
  return true;
}
