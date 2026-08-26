import type { DimensionId, StoryChapter, StoryChoice, StoryNode, TraitId } from "../../types";

const choice = (
  id: string,
  th: string,
  en: string,
  nextNodeId: string,
  dimensions: Partial<Record<DimensionId, number>>,
  traits: Partial<Record<TraitId, number>> = {},
): StoryChoice => ({ id, text: { th, en }, nextNodeId, scores: { dimensions, traits } });

const story = (
  id: string,
  th: string,
  en: string,
  nextNodeId: string,
): StoryNode => ({ id, type: "story", content: { th, en }, nextNodeId });

const choiceNode = (id: string, th: string, en: string, choices: StoryChoice[]): StoryNode => ({
  id,
  type: "choice",
  content: { th, en },
  choices,
});

const ending = (id: string, th: string, en: string): StoryNode => ({ id, type: "ending", content: { th, en } });

export const chapter01: StoryChapter = {
  id: "forest-rescue",
  title: { th: "หลงป่ากลางคืน", en: "Lost in the Night Forest" },
  description: {
    th: "ระหว่างภารกิจสำรวจของกิลด์นักผจญภัย คุณตื่นขึ้นกลางป่าที่ไม่คุ้นเคยพร้อมเด็กบาดเจ็บและอันตรายที่ใกล้เข้ามา",
    en: "During a Guild expedition, you wake in an unfamiliar forest with an injured child nearby and danger closing in.",
  },
  startNodeId: "forest-01-intro",
  nodes: [
    story(
      "forest-01-intro",
      "แสงแดดสาดผ่านใบไม้ปลุกคุณให้ตื่นกลางป่าที่ไม่คุ้นเคย เศษความทรงจำก่อนหน้าพร่าเลือน มีเพียงรอยเดินทางของคณะสำรวจกิลด์ที่หายไปในหมอก ใกล้ๆ กันนั้น เด็กคนหนึ่งนอนบาดเจ็บอยู่บนพื้นดิน และเสียงฝีเท้าของกลุ่มคนแปลกหน้ากำลังใกล้เข้ามาจากพุ่มไม้ทางขวา",
      "Sunlight through the leaves wakes you in an unfamiliar forest. Your memory of the expedition is hazy — the guild party's trail vanished into the mist. Nearby, an injured child lies on the ground, and footsteps are closing in from the bushes to your right.",
      "forest-02-crossroads",
    ),
    choiceNode(
      "forest-02-crossroads",
      "คุณจะทำอย่างไร?",
      "What do you do?",
      [
        choice(
          "help-child",
          "รีบเข้าไปช่วยเด็กทันที",
          "Rush to help the child immediately",
          "forest-03a-rescue",
          { responsibility: 2, adventure: 1 },
          { empathy: 0.3, determination: 0.2 },
        ),
        choice(
          "lure-enemies",
          "ล่อกลุ่มศัตรูให้ออกห่างจากเด็กก่อน",
          "Lure the enemies away from the child first",
          "forest-03a-rescue",
          { adventure: 3, responsibility: 1 },
          { determination: 0.3, confidence: 0.2 },
        ),
        choice(
          "hide-observe",
          "ซ่อนตัวสังเกตสถานการณ์ก่อนตัดสินใจ",
          "Hide and observe the situation before deciding",
          "forest-03b-scout",
          { decision: 2, social: -1 },
          { introspection: 0.3, resilience: 0.1 },
        ),
        choice(
          "call-for-help",
          "ส่งเสียงเรียกหาคณะสำรวจที่เหลือ",
          "Call out for the rest of the expedition",
          "forest-03b-scout",
          { social: 2, decision: 1 },
          { loyalty: 0.2, acceptance: 0.1 },
        ),
      ],
    ),
    story(
      "forest-03a-rescue",
      "คุณลงมือทันที เด็กคนนั้นสะดุ้งตื่นด้วยความตกใจแต่ก็ค่อยๆ ไว้ใจคุณ ทันทีที่พยุงเขาลุกขึ้น กลุ่มศัตรูก็เห็นคุณเข้าแล้ว",
      "You act at once. The child startles awake but slowly begins to trust you. The moment you help him up, the enemies spot you.",
      "forest-04-bridge",
    ),
    story(
      "forest-03b-scout",
      "คุณอดใจรอ สังเกตเห็นว่ากลุ่มศัตรูมีเพียงสามคน ไม่ชำนาญเส้นทาง เมื่อพวกเขาเดินผ่านไป คุณจึงค่อยเข้าไปหาเด็กอย่างเงียบๆ",
      "You hold back and notice the group is only three, unfamiliar with the terrain. Once they pass, you quietly approach the child.",
      "forest-04-bridge",
    ),
    story(
      "forest-04-bridge",
      "ไม่ว่าจะด้วยวิธีไหน ตอนนี้คุณกับเด็กคนนั้นปลอดภัยชั่วคราวอยู่ใต้รากไม้ใหญ่ เขากระซิบบอกว่าเห็นแคมป์ของคณะสำรวจอยู่ไม่ไกลนัก แต่ทางไปต้องผ่านหุบเขาที่มีเสียงคำรามแปลกๆ ดังออกมา",
      "Either way, you and the child are momentarily safe beneath a great tree's roots. He whispers that he saw the expedition's camp not far off — but the path there cuts through a ravine echoing with strange growls.",
      "forest-05-camp",
    ),
    choiceNode(
      "forest-05-camp",
      "คุณจะเตรียมตัวเข้าหุบเขาอย่างไร?",
      "How do you prepare to enter the ravine?",
      [
        choice(
          "lead-carefully",
          "นำทางอย่างระมัดระวัง คอยฟังเสียงรอบตัว",
          "Lead carefully, listening for every sound",
          "forest-06-ambush",
          { decision: 2 },
          { discipline: 0.2, reliability: 0.2 },
        ),
        choice(
          "reassure-child",
          "ปลอบใจเด็กให้ใจเย็นก่อนออกเดินทาง",
          "Reassure the child before setting off",
          "forest-06-ambush",
          { social: 2, lifestyle: 1 },
          { empathy: 0.2, sensitivity: 0.2 },
        ),
        choice(
          "push-forward",
          "รีบมุ่งหน้าเข้าไปโดยไม่รีรอ",
          "Push forward without hesitation",
          "forest-06-ambush",
          { adventure: 2, expression: 1 },
          { confidence: 0.3, ambition: 0.1 },
        ),
      ],
    ),
    choiceNode(
      "forest-06-ambush",
      "เสียงคำรามดังขึ้นใกล้ๆ เงาสัตว์ป่าตัวใหญ่ปรากฏขวางทาง คุณจะเลือกทางไหน?",
      "The growl grows close — a massive beast blocks the path. What do you choose?",
      [
        choice(
          "stand-fast",
          "ยืนหยัดปกป้องเด็กไว้ข้างหลัง",
          "Stand your ground, shielding the child behind you",
          "forest-07a-standfast",
          { responsibility: 2, adventure: 2 },
          { determination: 0.3, resolve: 0.2 },
        ),
        choice(
          "distract-beast",
          "ใช้สิ่งของล่อความสนใจสัตว์ร้ายออกไป",
          "Use an item to lure the beast away",
          "forest-07a-standfast",
          { decision: 2, expression: 1 },
          { creativity: 0.2, confidence: 0.1 },
        ),
        choice(
          "retreat-quiet",
          "ถอยกลับอย่างเงียบๆ หาทางอ้อม",
          "Retreat quietly and search for another way around",
          "forest-07b-retreat",
          { decision: -2, lifestyle: 1 },
          { introspection: 0.2, resilience: 0.2 },
        ),
        choice(
          "call-guild",
          "ส่งสัญญาณขอความช่วยเหลือจากกิลด์",
          "Signal for help from the guild",
          "forest-07b-retreat",
          { social: 3 },
          { loyalty: 0.3, acceptance: 0.1 },
        ),
      ],
    ),
    story(
      "forest-07a-standfast",
      "คุณเผชิญหน้ากับสัตว์ร้ายอย่างไม่ถอย ในที่สุดมันก็ล่าถอยไปเอง เด็กมองคุณด้วยสายตาเปี่ยมศรัทธา",
      "You face the beast without flinching. It eventually backs away. The child looks at you with unwavering faith.",
      "forest-08-dawn",
    ),
    story(
      "forest-07b-retreat",
      "คุณเลือกเส้นทางที่ปลอดภัยกว่า อ้อมผ่านหุบเขาไปได้อย่างเงียบเชียบ แม้จะช้ากว่าแต่ก็ไม่มีใครได้รับบาดเจ็บเพิ่ม",
      "You choose the safer path, slipping around the ravine in silence. Slower, but no one gets hurt.",
      "forest-08-dawn",
    ),
    ending(
      "forest-08-dawn",
      "รุ่งเช้ามาถึง คุณกับเด็กคนนั้นเดินมาถึงแคมป์ของคณะสำรวจกิลด์ในที่สุด เรื่องราวคืนนี้จะกลายเป็นอีกหนึ่งบทที่หล่อหลอมตัวตนของคุณต่อไป",
      "Dawn breaks. You and the child finally reach the guild expedition's camp. Tonight's story becomes one more chapter shaping who you are.",
    ),
  ],
  endings: [
    {
      id: "guardian",
      title: { th: "ผู้พิทักษ์แห่งป่า", en: "Guardian of the Forest" },
      epilogue: {
        th: "คุณเลือกที่จะยืนหยัดเพื่อคนอื่นเสมอ เรื่องราวคืนนี้แพร่กระจายไปทั่วกิลด์ ผู้คนเริ่มเรียกคุณว่าผู้พิทักษ์ที่ไม่เคยทิ้งใครไว้ข้างหลัง",
        en: "You chose, again and again, to stand for others. Word of tonight spreads through the guild — they begin calling you the guardian who never leaves anyone behind.",
      },
    },
    {
      id: "wanderer",
      title: { th: "นักสังเกตการณ์เงียบงัน", en: "The Quiet Observer" },
      epilogue: {
        th: "คุณเลือกที่จะสังเกตและตัดสินใจอย่างรอบคอบเสมอ แม้จะดูเย็นชาในสายตาคนอื่น แต่ทุกการตัดสินใจของคุณกลับพาทุกคนผ่านพ้นอันตรายไปได้อย่างปลอดภัยที่สุด",
        en: "You chose to observe and decide carefully, every time. It can look distant to others, but every choice you made brought everyone through the danger as safely as possible.",
      },
    },
  ],
};

export function selectStoryEnding(profile: { traits: Partial<Record<TraitId, number>> }): string {
  const guardianScore = ((profile.traits.empathy ?? 0) + (profile.traits.determination ?? 0)) / 2;
  const observerScore = ((profile.traits.introspection ?? 0) + (profile.traits.independence ?? 0)) / 2;
  return guardianScore >= observerScore ? "guardian" : "wanderer";
}
