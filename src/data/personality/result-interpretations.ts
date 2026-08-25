import type {
  DimensionId,
  LocalizedText,
  ResultInterpretation,
  TraitId,
} from "../../types";

export const resultTitleByDimension: Record<DimensionId, LocalizedText> = {
  social: { th: "ผู้เชื่อมโยงผู้คน", en: "The Social Connector" },
  decision: { th: "นักคิดผู้รอบคอบ", en: "The Clear-minded Thinker" },
  lifestyle: { th: "ผู้วางเส้นทาง", en: "The Deliberate Planner" },
  adventure: { th: "นักบุกเบิกผู้กล้า", en: "The Bold Pathfinder" },
  responsibility: { th: "ผู้พิทักษ์ที่ไว้ใจได้", en: "The Steadfast Guardian" },
  expression: { th: "ผู้ถ่ายทอดตัวตน", en: "The Open-hearted Voice" },
};

// Kept separate from result generation for now, so the copy can be reviewed
// independently before it is used in the UI.
export const traitInterpretations: Record<TraitId, LocalizedText> = {
  passion: {
    th: "คุณทุ่มพลังให้กับสิ่งที่ทำให้คุณรู้สึกมีความหมาย",
    en: "You pour your energy into what feels meaningful to you.",
  },
  enthusiasm: {
    th: "คุณมักส่งต่อพลังและความตื่นเต้นให้กับสิ่งที่กำลังทำ",
    en: "You bring energy and excitement to what is in front of you.",
  },
  selfExpression: {
    th: "คุณถ่ายทอดความคิดและความเป็นตัวเองออกมาได้อย่างชัดเจน",
    en: "You express your thoughts and sense of self clearly.",
  },
  determination: {
    th: "เมื่อเลือกเป้าหมายแล้ว คุณมุ่งไปข้างหน้าด้วยความตั้งใจ",
    en: "Once you choose a goal, you move toward it with purpose.",
  },
  optimism: {
    th: "คุณมองหาโอกาสและความหวัง แม้ในสถานการณ์ที่ไม่ง่าย",
    en: "You look for possibility and hope, even when things are difficult.",
  },

  ideals: {
    th: "คุณให้ความสำคัญกับหลักการและสิ่งที่เชื่อว่าควรเป็น",
    en: "You care deeply about your principles and what you believe should be.",
  },
  adaptability: {
    th: "คุณปรับวิธีรับมือได้ดีเมื่อแผนหรือสถานการณ์เปลี่ยนไป",
    en: "You adjust well when plans or circumstances change.",
  },
  responsibility: {
    th: "คุณรับผิดชอบต่อบทบาทและผลของการตัดสินใจของตน",
    en: "You take ownership of your role and the consequences of your choices.",
  },
  creativity: {
    th: "คุณมองเห็นวิธีใหม่ ๆ ในการแก้ปัญหาและสร้างสิ่งต่าง ๆ",
    en: "You see fresh ways to solve problems and create something new.",
  },
  perseverance: {
    th: "คุณทำสิ่งสำคัญอย่างต่อเนื่อง แม้ต้องใช้เวลาและความอดทน",
    en: "You stay with what matters, even when it takes time and patience.",
  },

  freedom: {
    th: "คุณเติบโตได้ดีเมื่อมีพื้นที่เลือกเส้นทางและจังหวะของตนเอง",
    en: "You thrive when you have room to choose your own path and pace.",
  },
  acceptance: {
    th: "คุณเปิดรับความแตกต่างและให้พื้นที่กับมุมมองที่หลากหลาย",
    en: "You welcome differences and make room for many perspectives.",
  },
  sensitivity: {
    th: "คุณรับรู้บรรยากาศและความรู้สึกที่ละเอียดอ่อนรอบตัวได้ดี",
    en: "You notice the subtle moods and feelings around you.",
  },
  selflessness: {
    th: "คุณพร้อมคำนึงถึงผู้อื่นและส่วนรวมควบคู่กับความต้องการของตน",
    en: "You readily consider others and the greater good alongside your own needs.",
  },

  individuality: {
    th: "คุณยืนอยู่กับความเป็นตัวเอง แม้จะต่างจากคนรอบข้าง",
    en: "You remain true to yourself, even when you differ from those around you.",
  },
  independence: {
    th: "คุณไว้ใจการตัดสินใจของตนและจัดการเส้นทางชีวิตได้ด้วยตัวเอง",
    en: "You trust your decisions and can steer your own course.",
  },
  confidence: {
    th: "คุณเชื่อมั่นในความสามารถและการตัดสินใจของตนเมื่อถึงเวลาต้องเลือก",
    en: "You trust your abilities and judgment when it is time to choose.",
  },
  nonconformity: {
    th: "คุณกล้าเลือกวิธีของตัวเอง เมื่อกรอบเดิมไม่ตอบโจทย์",
    en: "You are willing to choose your own way when the usual path does not fit.",
  },

  growth: {
    th: "คุณมองประสบการณ์เป็นโอกาสที่จะพัฒนาตัวเองต่อไป",
    en: "You see experience as a chance to keep developing.",
  },
  curiosity: {
    th: "คุณอยากรู้และพร้อมออกไปทำความเข้าใจสิ่งที่ยังไม่คุ้นเคย",
    en: "You are eager to explore and understand what is unfamiliar.",
  },
  knowledge: {
    th: "คุณให้คุณค่ากับความเข้าใจที่ลึกและข้อมูลที่เชื่อถือได้",
    en: "You value deep understanding and reliable information.",
  },
  learning: {
    th: "คุณเปิดใจรับบทเรียนใหม่ ๆ และนำมันไปใช้ต่อ",
    en: "You welcome new lessons and carry them forward.",
  },
  selfDevelopment: {
    th: "คุณตั้งใจขัดเกลาตัวเองทีละก้าวให้ดีขึ้น",
    en: "You deliberately refine yourself, one step at a time.",
  },

  innerConflict: {
    th: "คุณรับรู้แรงดึงระหว่างความต้องการหรือความเชื่อภายในใจ",
    en: "You are aware of the tensions between your inner wants or beliefs.",
  },
  contradiction: {
    th: "คุณยอมรับได้ว่าคนเรามีหลายด้านที่อาจไม่ลงรอยกันเสมอ",
    en: "You can accept that people contain sides that do not always align.",
  },
  identity: {
    th: "คุณใส่ใจกับการทำความเข้าใจว่าตัวเองเป็นใครและยืนอยู่เพื่ออะไร",
    en: "You care about understanding who you are and what you stand for.",
  },
  introspection: {
    th: "คุณให้เวลากับการทบทวนความคิดและความรู้สึกของตนอย่างลึกซึ้ง",
    en: "You make room to reflect deeply on your thoughts and feelings.",
  },
  resilience: {
    th: "คุณฟื้นตัวจากความยากลำบากและนำมันมาเป็นแรงผลักดันได้",
    en: "You recover from hardship and can turn it into momentum.",
  },

  resolve: {
    th: "คุณยืนหยัดกับสิ่งที่ตัดสินใจแล้ว แม้ต้องเผชิญแรงกดดัน",
    en: "You stand firm in your decisions, even under pressure.",
  },
  stability: {
    th: "คุณให้ความสำคัญกับความมั่นคงและจังหวะที่ไว้ใจได้",
    en: "You value stability and a rhythm you can rely on.",
  },
  discipline: {
    th: "คุณรักษาความตั้งใจและทำสิ่งที่ต้องทำอย่างสม่ำเสมอ",
    en: "You maintain your focus and follow through consistently.",
  },
  reliability: {
    th: "คนรอบตัววางใจได้ว่าคุณจะทำตามที่รับปากไว้",
    en: "Others can count on you to follow through on what you promise.",
  },

  leadership: {
    th: "คุณพร้อมช่วยกำหนดทิศทางและพาคนอื่นก้าวต่อไป",
    en: "You are ready to set a direction and help others move forward.",
  },
  empathy: {
    th: "คุณพยายามเข้าใจความรู้สึกและมุมมองของผู้อื่นอย่างจริงใจ",
    en: "You make a sincere effort to understand how others feel and see things.",
  },
  ambition: {
    th: "คุณมีแรงผลักดันที่จะไปให้ไกลกว่าเดิมและทำเป้าหมายให้สำเร็จ",
    en: "You are driven to go further and see your goals through.",
  },
  loyalty: {
    th: "คุณให้คุณค่ากับความผูกพันและอยู่เคียงข้างสิ่งหรือคนที่เลือกแล้ว",
    en: "You value lasting bonds and stand by the people or causes you choose.",
  },
  idealism: {
    th: "คุณเชื่อว่าสิ่งต่าง ๆ ดีขึ้นได้ และอยากมีส่วนทำให้เกิดขึ้น",
    en: "You believe things can be better and want to help make that happen.",
  },
  humor: {
    th: "คุณใช้ความขบขันช่วยให้บรรยากาศเบาลงและเชื่อมผู้คนเข้าหากัน",
    en: "You use humor to lighten the mood and bring people together.",
  },
  competitiveness: {
    th: "คุณมีแรงกระตุ้นจากความท้าทายและอยากพิสูจน์ศักยภาพของตน",
    en: "You are energized by challenge and by proving what you can do.",
  },
};

// These fragments are intentionally subject-free. A future result composer can
// join two matching traits into one natural sentence rather than repeating
// "คุณ... คุณ..." (for example: perseverance + learning).
export const traitPairPhrases: Record<TraitId, LocalizedText> = {
  passion: {
    th: "ทุ่มพลังให้กับสิ่งที่มีความหมาย",
    en: "pour energy into what feels meaningful",
  },
  enthusiasm: {
    th: "เติมพลังและความตื่นเต้นให้กับสิ่งที่ทำ",
    en: "bring energy and excitement to what they do",
  },
  selfExpression: {
    th: "ถ่ายทอดความคิดและตัวตนออกมาอย่างชัดเจน",
    en: "express their thoughts and identity clearly",
  },
  determination: {
    th: "มุ่งไปสู่เป้าหมายที่เลือกด้วยความตั้งใจ",
    en: "move purposefully toward the goals they choose",
  },
  optimism: {
    th: "มองหาโอกาสและความหวังในสถานการณ์ที่ไม่ง่าย",
    en: "look for possibility and hope in difficult moments",
  },

  ideals: {
    th: "ยึดมั่นกับหลักการที่เชื่อว่าถูกต้อง",
    en: "hold firmly to the principles they believe in",
  },
  adaptability: {
    th: "ปรับวิธีรับมือได้เมื่อสถานการณ์เปลี่ยนไป",
    en: "adapt their approach when circumstances change",
  },
  responsibility: {
    th: "รับผิดชอบต่อบทบาทและการตัดสินใจของตน",
    en: "take ownership of their role and decisions",
  },
  creativity: {
    th: "มองหาวิธีใหม่ในการแก้ปัญหา",
    en: "find fresh ways to solve problems",
  },
  perseverance: {
    th: "เดินหน้าสู่เป้าหมายอย่างไม่ย่อท้อ",
    en: "keep moving toward a goal with patience and resolve",
  },

  freedom: {
    th: "เลือกเส้นทางและจังหวะชีวิตของตนเอง",
    en: "choose their own path and pace",
  },
  acceptance: {
    th: "เปิดพื้นที่ให้กับความแตกต่าง",
    en: "make room for differences",
  },
  sensitivity: {
    th: "รับรู้บรรยากาศและความรู้สึกรอบตัวอย่างละเอียด",
    en: "notice the subtle moods and feelings around them",
  },
  selflessness: {
    th: "คำนึงถึงผู้อื่นและส่วนรวม",
    en: "consider others and the greater good",
  },

  individuality: {
    th: "ยืนอยู่กับความเป็นตัวเอง",
    en: "remain true to themselves",
  },
  independence: {
    th: "กำหนดเส้นทางของตนด้วยการตัดสินใจของตัวเอง",
    en: "steer their own course through independent decisions",
  },
  confidence: {
    th: "เชื่อมั่นในความสามารถและการตัดสินใจของตน",
    en: "trust their abilities and judgment",
  },
  nonconformity: {
    th: "กล้าเลือกวิธีของตนเมื่อกรอบเดิมไม่ตอบโจทย์",
    en: "choose their own way when the usual path does not fit",
  },

  growth: {
    th: "เปลี่ยนประสบการณ์ให้เป็นโอกาสเติบโต",
    en: "turn experience into an opportunity to grow",
  },
  curiosity: {
    th: "ออกไปทำความเข้าใจสิ่งที่ยังไม่คุ้นเคย",
    en: "explore and understand what is unfamiliar",
  },
  knowledge: {
    th: "ให้คุณค่ากับความเข้าใจที่ลึกและเชื่อถือได้",
    en: "value deep and reliable understanding",
  },
  learning: {
    th: "เรียนรู้จากทุกก้าวระหว่างทาง",
    en: "learn from each step along the way",
  },
  selfDevelopment: {
    th: "ขัดเกลาตัวเองให้ดีขึ้นทีละก้าว",
    en: "refine themselves one step at a time",
  },

  innerConflict: {
    th: "รับรู้แรงดึงระหว่างความต้องการภายในใจ",
    en: "recognize tensions between inner wants",
  },
  contradiction: {
    th: "ยอมรับความซับซ้อนและหลายด้านของผู้คน",
    en: "accept the complexity and many sides of people",
  },
  identity: {
    th: "ค้นหาว่าตัวเองเป็นใครและยืนอยู่เพื่ออะไร",
    en: "seek to understand who they are and what they stand for",
  },
  introspection: {
    th: "ทบทวนความคิดและความรู้สึกของตนอย่างลึกซึ้ง",
    en: "reflect deeply on their thoughts and feelings",
  },
  resilience: {
    th: "เปลี่ยนความยากลำบากให้เป็นแรงผลักดัน",
    en: "turn hardship into momentum",
  },

  resolve: {
    th: "ยืนหยัดกับสิ่งที่ตัดสินใจ แม้ต้องเผชิญแรงกดดัน",
    en: "stand firm in their decisions under pressure",
  },
  stability: {
    th: "สร้างความมั่นคงและจังหวะที่ไว้ใจได้",
    en: "create stability and a dependable rhythm",
  },
  discipline: {
    th: "รักษาความตั้งใจและทำสิ่งที่ต้องทำอย่างสม่ำเสมอ",
    en: "maintain focus and follow through consistently",
  },
  reliability: {
    th: "ทำตามสิ่งที่รับปากไว้",
    en: "follow through on what they promise",
  },

  leadership: {
    th: "ช่วยกำหนดทิศทางและพาคนอื่นก้าวต่อไป",
    en: "set a direction and help others move forward",
  },
  empathy: {
    th: "ใส่ใจความรู้สึกและมุมมองของผู้อื่น",
    en: "attend to others' feelings and perspectives",
  },
  ambition: {
    th: "ผลักดันตัวเองให้ไปได้ไกลกว่าเดิม",
    en: "push themselves to go further",
  },
  loyalty: {
    th: "อยู่เคียงข้างคนและสิ่งที่เลือกแล้ว",
    en: "stand by the people and causes they choose",
  },
  idealism: {
    th: "เชื่อว่าสิ่งต่าง ๆ ดีขึ้นได้ และอยากทำให้เกิดขึ้น",
    en: "believe things can be better and work to make it happen",
  },
  humor: {
    th: "ใช้ความขบขันเชื่อมผู้คนและทำให้บรรยากาศเบาลง",
    en: "use humor to connect people and lighten the mood",
  },
  competitiveness: {
    th: "ใช้ความท้าทายเป็นแรงผลักดันให้พิสูจน์ศักยภาพ",
    en: "use challenge as motivation to prove their potential",
  },
};

export interface TraitNarrative {
  lead: LocalizedText;
  follow: LocalizedText;
}

// Story-oriented clauses for Character Match summaries. `lead` follows the
// shared subject, while `follow` extends the same sentence when a second trait
// is available.
export const traitNarratives: Record<TraitId, TraitNarrative> = {
  passion: {
    lead: {
      th: "เลือกทุ่มทั้งแรงกายและแรงใจให้กับภารกิจที่มีความหมาย",
      en: "pour their energy into quests that feel meaningful",
    },
    follow: {
      th: "รักษาไฟในใจไว้แม้เส้นทางจะยากขึ้น",
      en: "keeping their inner spark alive as the road grows harder",
    },
  },
  enthusiasm: {
    lead: {
      th: "ก้าวเข้าสู่การผจญภัยด้วยพลังที่ชวนให้คนรอบข้างฮึกเหิม",
      en: "step into each adventure with energy that lifts those around them",
    },
    follow: {
      th: "เติมชีวิตชีวาให้ทุกช่วงของการเดินทาง",
      en: "bringing life to every stage of the journey",
    },
  },
  selfExpression: {
    lead: {
      th: "ฝากความคิดและตัวตนไว้ในทุกการตัดสินใจ",
      en: "leave a clear mark of who they are on every choice",
    },
    follow: {
      th: "ทำให้เส้นทางนั้นสะท้อนความเป็นตัวเองอย่างชัดเจน",
      en: "shaping the path into an honest reflection of themselves",
    },
  },
  determination: {
    lead: {
      th: "เลือกจุดหมายแล้วมุ่งไปโดยไม่ปล่อยให้ทางอ้อมทำให้ไขว้เขว",
      en: "choose a destination and press on without losing sight of it",
    },
    follow: {
      th: "รักษาทิศทางเดิมไว้เมื่อบททดสอบหนักขึ้น",
      en: "holding their course when the trials grow harder",
    },
  },
  optimism: {
    lead: {
      th: "มองเห็นแสงของโอกาสแม้ยามที่เส้นทางเบื้องหน้ามืดมน",
      en: "spot a glimmer of possibility even when the road ahead looks dark",
    },
    follow: {
      th: "ส่งต่อความหวังให้คณะเดินทางก้าวต่อไป",
      en: "passing that hope on so the party can keep moving",
    },
  },

  ideals: {
    lead: {
      th: "ยึดหลักที่เชื่อเป็นเข็มทิศเมื่อภารกิจบังคับให้ต้องเลือก",
      en: "use their principles as a compass when a quest demands a choice",
    },
    follow: {
      th: "ไม่ยอมทิ้งสิ่งสำคัญเพียงเพราะเส้นทางที่ง่ายกว่าเปิดอยู่",
      en: "refusing to abandon what matters simply because an easier road appears",
    },
  },
  adaptability: {
    lead: {
      th: "เปลี่ยนแผนได้ทันเมื่อเส้นทางจริงไม่เป็นอย่างที่แผนที่บอก",
      en: "change course when the road no longer matches the map",
    },
    follow: {
      th: "ใช้สิ่งที่มีอยู่พาคณะผ่านเหตุไม่คาดฝัน",
      en: "using what is at hand to guide the party through the unexpected",
    },
  },
  responsibility: {
    lead: {
      th: "รับภาระของบทบาทที่เลือกไว้จนกว่าภารกิจจะลุล่วง",
      en: "carry the weight of their chosen role until the quest is complete",
    },
    follow: {
      th: "ยอมรับผลของการตัดสินใจตลอดเส้นทาง",
      en: "owning the consequences of each decision along the way",
    },
  },
  creativity: {
    lead: {
      th: "มองเห็นทางออกใหม่ในจุดที่คนอื่นเห็นเพียงทางตัน",
      en: "find a new route where others see only a dead end",
    },
    follow: {
      th: "เปลี่ยนของธรรมดารอบตัวให้กลายเป็นกุญแจของภารกิจ",
      en: "turning ordinary things nearby into the key to the quest",
    },
  },
  perseverance: {
    lead: {
      th: "ยังเดินหน้าต่อแม้เส้นทางจะยาวไกลและเต็มไปด้วยอุปสรรค",
      en: "keep moving even when the road is long and filled with obstacles",
    },
    follow: {
      th: "ค่อย ๆ เปลี่ยนความอดทนให้พาไปถึงจุดหมาย",
      en: "letting patience carry them steadily toward the destination",
    },
  },

  freedom: {
    lead: {
      th: "เลือกเส้นทางของตัวเองแทนการเดินตามรอยที่คนอื่นกำหนด",
      en: "choose their own trail instead of following one laid out by others",
    },
    follow: {
      th: "เว้นพื้นที่ให้หัวใจได้กำหนดจังหวะของการเดินทาง",
      en: "leaving room for their hearts to set the pace of the journey",
    },
  },
  acceptance: {
    lead: {
      th: "เปิดที่ว่างในคณะให้ผู้คนต่างที่มาได้ร่วมเดินทาง",
      en: "make room in the party for companions from different paths",
    },
    follow: {
      th: "รับฟังเรื่องราวที่ต่างจากของตนโดยไม่รีบตัดสิน",
      en: "listening to unfamiliar stories without rushing to judge them",
    },
  },
  sensitivity: {
    lead: {
      th: "สังเกตความเปลี่ยนแปลงเล็ก ๆ ในบรรยากาศก่อนที่ใครจะเอ่ยออกมา",
      en: "notice subtle shifts in the air before anyone speaks of them",
    },
    follow: {
      th: "อ่านความรู้สึกของเพื่อนร่วมทางจากสิ่งที่ไม่ได้พูด",
      en: "reading what their companions feel in the words left unsaid",
    },
  },
  selflessness: {
    lead: {
      th: "ยื่นมือช่วยคณะก่อนคิดถึงความสะดวกของตัวเอง",
      en: "reach for the party's needs before their own comfort",
    },
    follow: {
      th: "แบ่งแรงและทรัพยากรเพื่อให้ทุกคนไปถึงปลายทางด้วยกัน",
      en: "sharing their strength and supplies so everyone can arrive together",
    },
  },

  individuality: {
    lead: {
      th: "เดินทางด้วยสีสันของตัวเองแม้จะแตกต่างจากคนทั้งคณะ",
      en: "travel in their own colors even when they stand apart from the party",
    },
    follow: {
      th: "ไม่ปล่อยให้เสียงรอบข้างกลบตัวตนที่แท้จริง",
      en: "keeping outside voices from drowning out who they truly are",
    },
  },
  independence: {
    lead: {
      th: "อ่านแผนที่และเลือกทิศทางด้วยวิจารณญาณของตัวเอง",
      en: "read the map and choose a direction through their own judgment",
    },
    follow: {
      th: "พร้อมรับมือกับสิ่งที่รออยู่บนเส้นทางที่เลือก",
      en: "accepting whatever waits along the path they chose",
    },
  },
  confidence: {
    lead: {
      th: "ก้าวออกไปตัดสินใจเมื่อทั้งคณะยังลังเลอยู่หน้าทางแยก",
      en: "step forward with a decision while the party hesitates at a crossroads",
    },
    follow: {
      th: "เชื่อในฝีมือของตัวเองเมื่อต้องรับมือกับบททดสอบตรงหน้า",
      en: "trusting their own ability when the next trial appears",
    },
  },
  nonconformity: {
    lead: {
      th: "ออกจากเส้นทางเดิมเมื่อกฎเก่าไม่พาไปสู่คำตอบ",
      en: "leave the familiar trail when old rules no longer lead to an answer",
    },
    follow: {
      th: "กล้าทดลองวิธีที่ยังไม่มีใครในคณะเลือกใช้",
      en: "trying an approach no one else in the party has chosen",
    },
  },

  growth: {
    lead: {
      th: "กลับจากแต่ละภารกิจพร้อมตัวตนที่แข็งแรงกว่าเดิม",
      en: "return from each quest stronger than when they began",
    },
    follow: {
      th: "เปลี่ยนทั้งชัยชนะและความผิดพลาดให้เป็นแรงเติบโต",
      en: "turning victories and mistakes alike into fuel for growth",
    },
  },
  curiosity: {
    lead: {
      th: "เปิดประตูที่ยังไม่รู้ว่ามีอะไรซ่อนอยู่เบื้องหลัง",
      en: "open the door without yet knowing what waits behind it",
    },
    follow: {
      th: "ตามรอยคำถามใหม่ไปไกลกว่าขอบแผนที่เดิม",
      en: "following new questions beyond the edge of the familiar map",
    },
  },
  knowledge: {
    lead: {
      th: "รวบรวมเบาะแสจนเรื่องราวที่กระจัดกระจายเริ่มเชื่อมถึงกัน",
      en: "gather clues until scattered pieces begin to form a story",
    },
    follow: {
      th: "ใช้ความเข้าใจที่ลึกพาคณะผ่านปริศนาที่ยากที่สุด",
      en: "using deep understanding to guide the party through its hardest puzzle",
    },
  },
  learning: {
    lead: {
      th: "เก็บทุกก้าวระหว่างทางมาเป็นบทเรียนสำหรับภารกิจถัดไป",
      en: "carry lessons from every step into the next quest",
    },
    follow: {
      th: "ยอมให้ประสบการณ์ใหม่เปลี่ยนวิธีมองเส้นทางเดิม",
      en: "letting new experience reshape how they see a familiar road",
    },
  },
  selfDevelopment: {
    lead: {
      th: "ฝึกฝนตัวเองทีละน้อยระหว่างการเดินทางแต่ละครั้ง",
      en: "refine themselves a little more with every journey",
    },
    follow: {
      th: "ตั้งเป้าหมายใหม่ทันทีที่ก้าวข้ามขีดจำกัดเดิม",
      en: "setting a new goal each time an old limit is crossed",
    },
  },

  innerConflict: {
    lead: {
      th: "เดินต่อทั้งที่เสียงสองด้านในใจยังชี้ไปคนละทาง",
      en: "keep walking while two voices within still point in different directions",
    },
    follow: {
      th: "เผชิญความลังเลนั้นแทนการซ่อนไว้ใต้ภารกิจใหม่",
      en: "facing that uncertainty instead of hiding it beneath another quest",
    },
  },
  contradiction: {
    lead: {
      th: "ยอมรับว่าคนคนเดียวอาจเป็นได้ทั้งแสงสว่างและเงา",
      en: "accept that one person can carry both light and shadow",
    },
    follow: {
      th: "ปล่อยให้ด้านที่ต่างกันอยู่ร่วมกันโดยไม่ต้องรีบหาคำตอบเดียว",
      en: "allowing opposing sides to coexist without forcing one simple answer",
    },
  },
  identity: {
    lead: {
      th: "ใช้ทุกทางแยกค้นหาว่าตัวเองเป็นใครและยืนอยู่เพื่ออะไร",
      en: "use each crossroads to discover who they are and what they stand for",
    },
    follow: {
      th: "เลือกเส้นทางที่ทำให้เสียงของตัวเองชัดเจนขึ้น",
      en: "choosing the road that makes their own voice clearer",
    },
  },
  introspection: {
    lead: {
      th: "หยุดพักเพื่อฟังความคิดของตัวเองก่อนออกเดินทางต่อ",
      en: "pause to hear their own thoughts before continuing the journey",
    },
    follow: {
      th: "มองย้อนกลับไปเพื่อเข้าใจว่าทุกก้าวเปลี่ยนใจอย่างไร",
      en: "looking back to understand how each step has changed them",
    },
  },
  resilience: {
    lead: {
      th: "ลุกขึ้นจากความพ่ายแพ้พร้อมแรงใจสำหรับการเดินทางครั้งใหม่",
      en: "rise from defeat with strength for another journey",
    },
    follow: {
      th: "เปลี่ยนรอยแผลจากบททดสอบให้กลายเป็นเกราะของวันข้างหน้า",
      en: "turning the marks of past trials into armor for what comes next",
    },
  },

  resolve: {
    lead: {
      th: "ยืนหยัดกับคำตอบของตัวเองเมื่อแรงกดดันถาโถมเข้ามา",
      en: "stand by their answer when pressure closes in",
    },
    follow: {
      th: "ไม่ปล่อยให้พายุระหว่างทางเปลี่ยนจุดหมายที่เลือกไว้",
      en: "refusing to let storms along the way change the destination",
    },
  },
  stability: {
    lead: {
      th: "สร้างจุดพักที่มั่นคงให้คณะกลับมาตั้งหลักได้เสมอ",
      en: "build a steady place where the party can always regroup",
    },
    follow: {
      th: "รักษาจังหวะที่ไว้ใจได้ท่ามกลางการเดินทางที่ผันผวน",
      en: "maintaining a dependable rhythm through an uncertain journey",
    },
  },
  discipline: {
    lead: {
      th: "ทำสิ่งที่ต้องทำต่อเนื่องแม้ไม่มีใครคอยเฝ้ามอง",
      en: "keep doing what must be done even when no one is watching",
    },
    follow: {
      th: "ใช้กิจวัตรเล็ก ๆ เตรียมตัวให้พร้อมก่อนบททดสอบมาถึง",
      en: "using small routines to prepare before the next trial arrives",
    },
  },
  reliability: {
    lead: {
      th: "กลับมาตามเวลาพร้อมสิ่งที่รับปากไว้กับเพื่อนร่วมทาง",
      en: "return when promised with what their companions were counting on",
    },
    follow: {
      th: "กลายเป็นคนที่คณะวางใจให้ดูแลภารกิจสำคัญ",
      en: "becoming the companion trusted with the party's vital tasks",
    },
  },

  leadership: {
    lead: {
      th: "ก้าวขึ้นมากำหนดทิศทางเมื่อคณะยังหาทางไปต่อไม่พบ",
      en: "step forward with a direction when the party cannot see the way ahead",
    },
    follow: {
      th: "ทำให้ทุกคนเห็นบทบาทของตนในภารกิจเดียวกัน",
      en: "helping every companion see their place in the same quest",
    },
  },
  empathy: {
    lead: {
      th: "ฟังเรื่องราวของเพื่อนร่วมทางจนเข้าใจสิ่งที่ซ่อนอยู่หลังคำพูด",
      en: "listen until they understand what lies behind a companion's words",
    },
    follow: {
      th: "เลือกวิธีเดินหน้าที่ไม่ทิ้งความรู้สึกของใครไว้ข้างหลัง",
      en: "choosing a way forward that leaves no one's feelings behind",
    },
  },
  ambition: {
    lead: {
      th: "มองยอดเขาถัดไปทันทีที่พิชิตจุดหมายเดิมสำเร็จ",
      en: "look toward the next summit as soon as one goal is reached",
    },
    follow: {
      th: "ใช้เป้าหมายที่ไกลกว่าเดิมเรียกศักยภาพออกมา",
      en: "using a more distant goal to draw out their full potential",
    },
  },
  loyalty: {
    lead: {
      th: "ยังอยู่เคียงข้างผู้ร่วมทางเมื่อภารกิจเข้าสู่ช่วงยากที่สุด",
      en: "remain beside their companions when the quest reaches its hardest point",
    },
    follow: {
      th: "รักษาสายสัมพันธ์ที่เลือกไว้ไม่ว่าเส้นทางจะพาไปไกลเพียงใด",
      en: "honoring chosen bonds no matter how far the road carries them",
    },
  },
  idealism: {
    lead: {
      th: "มองโลกที่ดีกว่าอยู่หลังขอบฟ้าและออกเดินทางเพื่อพามันใกล้ขึ้น",
      en: "see a better world beyond the horizon and journey to bring it closer",
    },
    follow: {
      th: "เปลี่ยนความหวังให้เป็นการลงมือทำในภารกิจตรงหน้า",
      en: "turning hope into action within the quest at hand",
    },
  },
  humor: {
    lead: {
      th: "เปลี่ยนคืนที่เงียบตึงรอบกองไฟให้เต็มไปด้วยเสียงหัวเราะ",
      en: "turn a tense night by the campfire into shared laughter",
    },
    follow: {
      th: "ใช้มุกเล็ก ๆ ประคองขวัญคณะในวันที่เหนื่อยล้า",
      en: "using a small joke to lift the party through a weary day",
    },
  },
  competitiveness: {
    lead: {
      th: "มองคู่แข่งและบททดสอบเป็นแรงผลักให้ก้าวไกลกว่าเดิม",
      en: "treat rivals and trials as a reason to push beyond yesterday",
    },
    follow: {
      th: "เปลี่ยนทุกการประลองให้เป็นโอกาสพิสูจน์ฝีมือ",
      en: "turning every contest into a chance to prove their skill",
    },
  },
};

export const visionInterpretations: Record<string, ResultInterpretation> = {
  pyro: {
    title: { th: "แรงขับแห่งเปลวไฟ", en: "The Drive of Flame" },
    summary: {
      th: "คุณขับเคลื่อนด้วยพลัง ความมุ่งมั่น และการแสดงตัวตนอย่างจริงใจ",
      en: "You are moved by energy, determination, and sincere self-expression.",
    },
  },
  hydro: {
    title: { th: "กระแสแห่งอุดมการณ์", en: "The Current of Ideals" },
    summary: {
      th: "คุณให้ความสำคัญกับคุณค่า ความเข้าใจผู้อื่น และการปรับตัวเพื่อสิ่งที่มีความหมาย",
      en: "You value ideals, understanding others, and adapting for what matters.",
    },
  },
  anemo: {
    title: { th: "สายลมแห่งอิสรภาพ", en: "The Wind of Freedom" },
    summary: {
      th: "คุณเติบโตเมื่อมีอิสระ เปิดรับความแตกต่าง และเลือกเส้นทางของตนเอง",
      en: "You thrive with freedom, welcome difference, and choose your own path.",
    },
  },
  electro: {
    title: { th: "ประกายแห่งตัวตน", en: "The Spark of Individuality" },
    summary: {
      th: "คุณยืนหยัดในตัวตนและตัดสินใจตามหลักที่เชื่อ",
      en: "You stand by your identity and decide according to your own principles.",
    },
  },
  dendro: {
    title: { th: "รากแห่งการเติบโต", en: "The Roots of Growth" },
    summary: {
      th: "ความใฝ่รู้และการเรียนรู้อย่างต่อเนื่องทำให้คุณเห็นความเป็นไปได้ใหม่",
      en: "Curiosity and continuous learning help you see new possibilities.",
    },
  },
  cryo: {
    title: { th: "ผลึกแห่งการใคร่ครวญ", en: "The Crystal of Reflection" },
    summary: {
      th: "คุณมองความซับซ้อนภายในอย่างจริงจังและเปลี่ยนความยากลำบากเป็นความเข้มแข็ง",
      en: "You take inner complexity seriously and turn hardship into resilience.",
    },
  },
  geo: {
    title: { th: "ศิลาผู้แน่วแน่", en: "The Steadfast Stone" },
    summary: {
      th: "คุณสร้างความมั่นคงผ่านความรับผิดชอบ วินัย และการยืนหยัดต่อสิ่งสำคัญ",
      en: "You create stability through responsibility, discipline, and resolve.",
    },
  },
};
