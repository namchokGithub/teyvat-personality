import type { CharacterMatch, QuizQuestion, VisionMatch } from "../types";
import { getCharacterArtwork } from "./characters/artwork";

const placeholderPrompt = {
  th: "เมื่อแผนที่วางไว้เปลี่ยนกะทันหัน คุณมักจะทำอย่างไร?",
  en: "When a carefully made plan suddenly changes, what do you usually do?",
};

export const mockQuestions: QuizQuestion[] = Array.from({ length: 24 }, (_, index) => ({
  id: `question-${index + 1}`,
  prompt:
    index === 0
      ? placeholderPrompt
      : {
          th: `คำถามตัวอย่างข้อที่ ${index + 1} — เนื้อหาจริงจะเพิ่มในขั้นออกแบบคำถาม`,
          en: `Sample question ${index + 1} — final copy will be added during question design.`,
        },
  answers: [
    {
      id: "observe",
      label: { th: "หยุดสังเกตสถานการณ์ก่อน แล้วค่อยตัดสินใจ", en: "Pause, observe, then decide" },
    },
    {
      id: "adapt",
      label: { th: "ปรับตัวทันทีและลองวิธีใหม่", en: "Adapt quickly and try a new path" },
    },
    {
      id: "support",
      label: { th: "ถามคนรอบตัวว่าทุกคนต้องการอะไร", en: "Ask what everyone around me needs" },
    },
    {
      id: "lead",
      label: { th: "ตั้งเป้าหมายใหม่และพาทุกคนเดินหน้าต่อ", en: "Set a new goal and lead the way" },
    },
  ],
}));

export const mockCharacter: CharacterMatch = {
  characterId: "nahida",
  name: "Nahida",
  element: "Dendro",
  region: "Sumeru",
  compatibility: 92,
  title: { th: "ผู้เฝ้ามองที่อ่อนโยน", en: "The Gentle Observer" },
  summary: {
    th: "คุณชอบสังเกตและทำความเข้าใจสิ่งต่าง ๆ ก่อนตัดสินใจ ให้ความสำคัญกับความรู้สึกของผู้อื่น และยังพร้อมยืนหยัดเพื่อสิ่งที่เชื่อว่าถูกต้อง",
    en: "You observe and seek understanding before deciding. You care deeply about others while standing up for what you believe is right.",
  },
  matchingTraits: [
    { th: "ช่างสังเกต", en: "Observant" },
    { th: "เห็นอกเห็นใจ", en: "Empathetic" },
    { th: "ใฝ่รู้", en: "Curious" },
  ],
  artworkUrl: getCharacterArtwork("nahida", "full")?.url,
};

export const mockVision: VisionMatch = {
  element: "Dendro",
  affinity: 88,
  summary: {
    th: "ความใฝ่รู้ การเติบโต และการมองเห็นความเชื่อมโยงทำให้ Dendro สอดคล้องกับคุณมากที่สุด",
    en: "Curiosity, growth, and a gift for seeing connections make Dendro your strongest affinity.",
  },
};
