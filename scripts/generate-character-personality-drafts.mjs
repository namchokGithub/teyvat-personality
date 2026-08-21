import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const dataRoot = path.join(projectRoot, "src/data");
const characterDirectory = path.join(dataRoot, "characters");
const loreDirectory = path.join(dataRoot, "lore");
const profileDirectory = path.join(dataRoot, "personality/character-personalities");
const reportPath = path.join(profileDirectory, "_generation-review-report.md");
const dimensions = ["social", "decision", "lifestyle", "adventure", "responsibility", "expression"];

const signals = {
  social: {
    positive: ["ร่าเริง", "ชวน", "เป็นมิตร", "เข้าสังคม", "พูดมาก", "กระตือรือร้น", "ผู้นำ", "ต้อนรับ", "แข่งขัน"],
    negative: ["เก็บตัว", "พูดน้อย", "อยู่คนเดียว", "ต้องการพื้นที่ส่วนตัว", "หลีกเลี่ยงปฏิสัมพันธ์", "ไว้ใจยาก", "รักษาระยะ", "เข้าถึงยาก"],
  },
  decision: {
    positive: ["วิเคราะห์", "คำนวณ", "เหตุผล", "หลักฐาน", "วางแผน", "เป็นระบบ", "ข้อเท็จจริง", "ประเมิน", "ตรรกะ"],
    negative: ["อารมณ์", "ความรู้สึก", "สัญชาตญาณ", "หุนหัน", "ความผูกพัน", "อุดมคติ", "หัวใจ"],
  },
  lifestyle: {
    positive: ["วินัย", "กิจวัตร", "วางแผน", "เป็นระบบ", "จัดระเบียบ", "เตรียม", "เคร่งครัด", "ควบคุมตน"],
    negative: ["หุนหัน", "ยืดหยุ่น", "ไร้กรอบ", "ไม่เป็นระเบียบ", "ด้นสด", "อิสระ", "ละเลย"],
  },
  adventure: {
    positive: ["กล้าหาญ", "สำรวจ", "เสี่ยง", "ผจญภัย", "ต่อสู้", "เดินทาง", "ทดลอง", "เผชิญ"],
    negative: ["ระวัง", "หลีกเลี่ยง", "กลัว", "ปลอดภัย", "ไม่ชอบความเสี่ยง"],
  },
  responsibility: {
    positive: ["หน้าที่", "รับผิดชอบ", "ดูแล", "ปกป้อง", "คำมั่น", "ภักดี", "รักษาคำพูด", "อุทิศ", "ผู้พิทักษ์"],
    negative: ["หลีกเลี่ยงหน้าที่", "ไม่รับผิดชอบ", "อิสระจากภาระ"],
  },
  expression: {
    positive: ["แสดงออก", "พูดตรง", "ร่าเริง", "กระตือรือร้น", "โอ้อวด", "เปิดเผย", "อารมณ์ชัด", "พูดมาก"],
    negative: ["เก็บตัว", "สุขุม", "พูดน้อย", "เก็บความรู้สึก", "รักษาระยะ", "เย็นชา", "ไม่เปิดเผย"],
  },
};

const traitSignals = {
  passion: ["หลงใหล", "พลังงาน", "ร้อนแรง"], enthusiasm: ["กระตือรือร้น", "ร่าเริง"], selfExpression: ["แสดงออก", "ศิลปะ", "พูดตรง"], determination: ["ยืนหยัด", "ไม่ยอมแพ้", "มุ่งมั่น"], optimism: ["มองโลกในแง่ดี", "ความหวัง"],
  ideals: ["อุดมคติ", "ความยุติธรรม", "ความจริง"], adaptability: ["ปรับตัว", "ยืดหยุ่น", "เรียนรู้โลก"], responsibility: ["รับผิดชอบ", "หน้าที่", "ดูแล"], creativity: ["สร้างสรรค์", "ประดิษฐ์", "ศิลปะ", "จินตนาการ"], perseverance: ["พากเพียร", "ไม่ยอมแพ้", "ฝึกฝน"],
  freedom: ["เสรีภาพ", "อิสระ"], acceptance: ["ยอมรับ", "เข้าใจความต่าง"], sensitivity: ["อ่อนไหว", "ความรู้สึก"], selflessness: ["เสียสละ", "ช่วยเหลือ"],
  individuality: ["เป็นตัวเอง", "ตัวตน"], independence: ["พึ่งพาตนเอง", "อิสระ"], confidence: ["มั่นใจ", "เชื่อมั่น"], nonconformity: ["ต่อต้าน", "ไม่ยอม", "นอกกรอบ"],
  growth: ["เติบโต", "พัฒนา"], curiosity: ["อยากรู้", "ใฝ่รู้", "ค้นหา"], knowledge: ["ความรู้", "วิจัย", "ศึกษา"], learning: ["เรียนรู้", "ฝึกฝน"], selfDevelopment: ["พัฒนาตน", "ฝึกฝน"],
  innerConflict: ["ขัดแย้ง", "บาดแผล", "ต่อสู้กับ"], contradiction: ["ขัดแย้ง", "สองด้าน"], identity: ["ตัวตน", "ต้นกำเนิด"], introspection: ["ทบทวน", "ภายใน"], resilience: ["ฟื้น", "อดทน", "ผ่านการสูญเสีย"],
  resolve: ["ยืนหยัด", "ปณิธาน"], stability: ["สุขุม", "มั่นคง"], discipline: ["วินัย", "ฝึก", "ควบคุมตน"], reliability: ["รับผิดชอบ", "คำมั่น", "ไว้วางใจ"],
};

const strengthRules = [
  [/[วว]ิเคราะห์|คำนวณ|หลักฐาน|วางแผน/, "วิเคราะห์และแก้ปัญหาอย่างเป็นระบบ"],
  [/ปกป้อง|ดูแล|รับผิดชอบ|หน้าที่/, "ปกป้องและรับผิดชอบต่อผู้อื่น"],
  [/กล้าหาญ|ผจญภัย|เผชิญ|ต่อสู้/, "กล้าเผชิญความท้าทาย"],
  [/สร้างสรรค์|ประดิษฐ์|ศิลปะ|จินตนาการ/, "สร้างสรรค์และพัฒนาสิ่งใหม่"],
  [/วินัย|ฝึกฝน|พากเพียร|ไม่ยอมแพ้/, "มุ่งมั่นพัฒนาตนเองอย่างต่อเนื่อง"],
  [/เข้าใจ|เมตตา|ช่วยเหลือ|เห็นอกเห็นใจ/, "เข้าใจและช่วยเหลือผู้อื่น"],
];

const weaknessRules = [
  [/เก็บตัว|ไว้ใจยาก|รักษาระยะ|เข้าถึงยาก/, "เข้าถึงยากหรือเปิดใจช้า"],
  [/หุนหัน|อารมณ์.*ควบคุม|โมโห/, "หุนหันเมื่ออารมณ์หรือแรงกดดันสูง"],
  [/ละเลย.*พัก|ไม่ยอมพัก|หมดแรง|ทำงานต่อเนื่อง/, "หมกมุ่นจนละเลยการพักผ่อน"],
  [/เสี่ยง|อันตราย|ประเมินความเสี่ยง.*ต่ำ/, "รับความเสี่ยงมากเกินไป"],
  [/พูดตรง|รุนแรงเกิน|ทำร้ายความรู้สึก/, "พูดตรงจนกระทบความรู้สึกผู้อื่น"],
  [/กังวล|กลัว|บาดแผล|ความโดดเดี่ยว/, "แบกรับความกดดันและบาดแผลไว้กับตนเอง"],
];

const readJson = async (filePath) => JSON.parse(await readFile(filePath, "utf8"));
const countMatches = (text, terms) => terms.reduce((count, term) => count + (text.split(term).length - 1), 0);
const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));

function scoreDimension(text, signal) {
  const positive = countMatches(text, signal.positive);
  const negative = countMatches(text, signal.negative);
  return { value: Math.round(clamp(50 + (positive - negative) * 5, 15, 85)), evidenceCount: positive + negative };
}

function collectLabels(text, rules, fallbacks) {
  const labels = rules.filter(([pattern]) => pattern.test(text)).map(([, label]) => label);
  return [...new Set([...labels, ...fallbacks])].slice(0, 3);
}

function draftProfile(character, lore, elementProfile) {
  const evidence = [
    lore.personalityNotes,
    lore.behaviorPatterns,
    lore.conflicts,
    lore.motivations,
    lore.values,
    lore.strengthEvidence,
    lore.weaknessEvidence,
    lore.analysisNotes,
  ].flat().join(" ");
  const dimensionScores = Object.fromEntries(dimensions.map((dimension) => [dimension, scoreDimension(evidence, signals[dimension])]));
  const traits = Object.fromEntries(Object.entries(elementProfile.personalityTheme.traits).map(([trait, baseline]) => {
    const matches = countMatches(evidence, traitSignals[trait] ?? []);
    return [trait, Number(clamp(baseline + Math.min(matches, 4) * 0.05, 0, 1).toFixed(2))];
  }));
  return {
    profile: {
      id: character.id,
      personality: Object.fromEntries(dimensions.map((dimension) => [dimension, dimensionScores[dimension].value])),
      traits,
      strengths: collectLabels(lore.strengthEvidence.join(" "), strengthRules, [
        "ยืนหยัดต่อเป้าหมายที่ให้ความสำคัญ",
        "เรียนรู้จากประสบการณ์และปรับตัว",
        "รักษาความตั้งใจเมื่อเผชิญอุปสรรค",
      ]),
      weaknesses: collectLabels(lore.weaknessEvidence.join(" "), weaknessRules, [
        "กดดันตนเองกับมาตรฐานสูง",
        "ต้องใช้เวลาในการจัดการความรู้สึก",
        "อาจแบกรับปัญหาไว้คนเดียว",
      ]),
    },
    evidenceCounts: Object.fromEntries(dimensions.map((dimension) => [dimension, dimensionScores[dimension].evidenceCount])),
  };
}

const ids = (await readJson(path.join(loreDirectory, "_characters.json"))).map(({ id }) => id);
const elementProfiles = await readJson(path.join(dataRoot, "personality/element-personalities.json"));
const elementProfileById = new Map(elementProfiles.map((profile) => [profile.elementId, profile]));
const existingFiles = new Set((await readdir(profileDirectory)).filter((file) => file.endsWith(".json") && !file.startsWith("_")).map((file) => file.slice(0, -5)));
const overwriteDrafts = process.argv.includes("--overwrite-drafts");
const preservedProfileIds = new Set(["aino", "albedo", "alhaitham"]);
const created = [];
const errors = [];
const warnings = [];

await mkdir(profileDirectory, { recursive: true });

for (const id of ids) {
  if (existingFiles.has(id) && (!overwriteDrafts || preservedProfileIds.has(id))) continue;
  try {
    const [character, lore] = await Promise.all([
      readJson(path.join(characterDirectory, `${id}.json`)),
      readJson(path.join(loreDirectory, `${id}.json`)),
    ]);
    if (character.id !== id || lore.id !== id) throw new Error("character or lore id does not match index id");
    if (!character.element) throw new Error("character has no element for the element-trait baseline");
    const elementProfile = elementProfileById.get(character.element.toLowerCase());
    if (!elementProfile) throw new Error(`no element trait baseline for ${character.element}`);
    const { profile, evidenceCounts } = draftProfile(character, lore, elementProfile);
    await writeFile(path.join(profileDirectory, `${id}.json`), `${JSON.stringify(profile, null, 2)}\n`);
    created.push(id);
    const weakDimensions = Object.entries(evidenceCounts).filter(([, count]) => count < 2).map(([dimension]) => dimension);
    if (weakDimensions.length) warnings.push({ id, detail: `keyword evidence ต่ำกว่า 2 จุดสำหรับ ${weakDimensions.join(", ")}` });
  } catch (error) {
    errors.push({ id, detail: error instanceof Error ? error.message : String(error) });
  }
}

const report = [
  "# Character Personality Draft Generation Review",
  "",
  "> Generated from local structured lore as a first-pass fan-made interpretation. This report records structural errors and low-evidence dimension warnings for manual review; it does not alter factual character or lore data.",
  "",
  "## Summary",
  "",
  `- Indexed characters: ${ids.length}`,
  `- Profiles created in this run: ${created.length}`,
  `- Existing profiles preserved: ${existingFiles.size}`,
  `- Structural errors: ${errors.length}`,
  `- Manual-review warnings: ${warnings.length}`,
  "",
  "## Structural errors",
  "",
  ...(errors.length ? errors.map(({ id, detail }) => `- \`${id}\` — ${detail}`) : ["- None."]),
  "",
  "## Manual-review warnings",
  "",
  ...(warnings.length ? warnings.map(({ id, detail }) => `- \`${id}\` — ${detail}`) : ["- None."]),
  "",
  "## Review rules",
  "",
  "- Review all draft scores as fan-made interpretations against the matching lore file before treating them as final.",
  "- Prioritize profiles listed above: a low keyword-evidence count does not mean the lore is empty; it means this deterministic draft needs closer human interpretation for that dimension.",
  "- Confirm that strengths and weaknesses describe recurring evidence rather than a single event.",
].join("\n");

await writeFile(reportPath, `${report}\n`);
console.log(`Created ${created.length} profile drafts; ${errors.length} errors; ${warnings.length} warnings.`);
