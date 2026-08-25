import process from "node:process";
import { createServer } from "vite";

const SAMPLE_SIZE = 10_000;
let seed = 0x5eed1234;
const random = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 0x1_0000_0000;
};
const increment = (map, key) => map.set(key, (map.get(key) ?? 0) + 1);
const percentage = (count) => `${((count / SAMPLE_SIZE) * 100).toFixed(2)}%`;
const pickRandom = (values, count) => {
  const pool = [...values];
  const picked = [];
  for (let index = 0; index < count && pool.length > 0; index += 1) {
    const target = Math.floor(random() * pool.length);
    picked.push(pool.splice(target, 1)[0]);
  }
  return picked;
};

const server = await createServer({ root: process.cwd(), appType: "custom", server: { middlewareMode: true, hmr: false }, logLevel: "error" });
try {
  const [{ questions }, engine, { loadAllCharacterPersonalities }, { elementProfiles }, { DIMENSION_IDS }] = await Promise.all([
    server.ssrLoadModule("/src/data/quiz/questions.ts"),
    server.ssrLoadModule("/src/engine/index.ts"),
    server.ssrLoadModule("/src/data/personality/repository.ts"),
    server.ssrLoadModule("/src/data/personality/element-profiles.ts"),
    server.ssrLoadModule("/src/types/index.ts"),
  ]);
  const profiles = await loadAllCharacterPersonalities();
  const characterWins = new Map();
  const characterTopThree = new Map();
  const visionWins = new Map();

  for (let index = 0; index < SAMPLE_SIZE; index += 1) {
    const selectedQuestions = DIMENSION_IDS.flatMap((dimensionId) =>
      pickRandom(questions.filter((question) => question.dimensionId === dimensionId), engine.QUESTIONS_PER_DIMENSION),
    );
    const answers = Object.fromEntries(selectedQuestions.map((question) => {
      const selected = question.answers[Math.floor(random() * question.answers.length)];
      return [question.id, selected.id];
    }));
    const profile = engine.buildUserPersonalityProfile(answers, selectedQuestions);
    const characters = engine.rankCharacterMatches(profile, profiles);
    const visions = engine.rankVisionAffinities(profile, elementProfiles);
    increment(characterWins, characters[0].characterId);
    for (const character of characters.slice(0, 3)) increment(characterTopThree, character.characterId);
    increment(visionWins, visions[0].elementId);
  }

  const sorted = (map) => [...map.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]));
  console.log(`Balance simulation (${SAMPLE_SIZE} deterministic random answer sets)`);
  console.log("Vision winners:");
  for (const [id, count] of sorted(visionWins)) console.log(`  ${id.padEnd(8)} ${String(count).padStart(5)} (${percentage(count)})`);
  console.log("Top 10 character winners:");
  for (const [id, count] of sorted(characterWins).slice(0, 10)) console.log(`  ${id.padEnd(24)} ${String(count).padStart(5)} (${percentage(count)})`);
  const neverTopThree = profiles.map(({ id }) => id).filter((id) => !characterTopThree.has(id));
  console.log(`Characters never in Top 3: ${neverTopThree.length}/${profiles.length}`);
  if (neverTopThree.length) console.log(`  ${neverTopThree.join(", ")}`);
} finally {
  await server.close();
}
