import type { DimensionId, LocalizedText, ResultInterpretation } from "../../types";

export const resultTitleByDimension: Record<DimensionId, LocalizedText> = {
  social: { th: "ผู้เชื่อมโยงผู้คน", en: "The Social Connector" },
  decision: { th: "นักคิดผู้รอบคอบ", en: "The Clear-minded Thinker" },
  lifestyle: { th: "ผู้วางเส้นทาง", en: "The Deliberate Planner" },
  adventure: { th: "นักบุกเบิกผู้กล้า", en: "The Bold Pathfinder" },
  responsibility: { th: "ผู้พิทักษ์ที่ไว้ใจได้", en: "The Steadfast Guardian" },
  expression: { th: "ผู้ถ่ายทอดตัวตน", en: "The Open-hearted Voice" },
};

export const visionInterpretations: Record<string, ResultInterpretation> = {
  pyro: { title: { th: "แรงขับแห่งเปลวไฟ", en: "The Drive of Flame" }, summary: { th: "คุณขับเคลื่อนด้วยพลัง ความมุ่งมั่น และการแสดงตัวตนอย่างจริงใจ", en: "You are moved by energy, determination, and sincere self-expression." } },
  hydro: { title: { th: "กระแสแห่งอุดมการณ์", en: "The Current of Ideals" }, summary: { th: "คุณให้ความสำคัญกับคุณค่า ความเข้าใจผู้อื่น และการปรับตัวเพื่อสิ่งที่มีความหมาย", en: "You value ideals, understanding others, and adapting for what matters." } },
  anemo: { title: { th: "สายลมแห่งอิสรภาพ", en: "The Wind of Freedom" }, summary: { th: "คุณเติบโตเมื่อมีอิสระ เปิดรับความแตกต่าง และเลือกเส้นทางของตนเอง", en: "You thrive with freedom, welcome difference, and choose your own path." } },
  electro: { title: { th: "ประกายแห่งตัวตน", en: "The Spark of Individuality" }, summary: { th: "คุณยืนหยัดในตัวตนและตัดสินใจตามหลักที่เชื่อ", en: "You stand by your identity and decide according to your own principles." } },
  dendro: { title: { th: "รากแห่งการเติบโต", en: "The Roots of Growth" }, summary: { th: "ความใฝ่รู้และการเรียนรู้อย่างต่อเนื่องทำให้คุณเห็นความเป็นไปได้ใหม่", en: "Curiosity and continuous learning help you see new possibilities." } },
  cryo: { title: { th: "ผลึกแห่งการใคร่ครวญ", en: "The Crystal of Reflection" }, summary: { th: "คุณมองความซับซ้อนภายในอย่างจริงจังและเปลี่ยนความยากลำบากเป็นความเข้มแข็ง", en: "You take inner complexity seriously and turn hardship into resilience." } },
  geo: { title: { th: "ศิลาผู้แน่วแน่", en: "The Steadfast Stone" }, summary: { th: "คุณสร้างความมั่นคงผ่านความรับผิดชอบ วินัย และการยืนหยัดต่อสิ่งสำคัญ", en: "You create stability through responsibility, discipline, and resolve." } },
};
