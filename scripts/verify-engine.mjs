import process from "node:process";
import { createServer } from "vite";

const server = await createServer({ root: process.cwd(), appType: "custom", server: { middlewareMode: true, hmr: false }, logLevel: "error" });
const assert = (condition, message) => { if (!condition) throw new Error(message); };

try {
  const [{ questions }, engine, { loadAllCharacterPersonalities }, { elementProfiles }] = await Promise.all([
    server.ssrLoadModule("/src/data/quiz/questions.ts"),
    server.ssrLoadModule("/src/engine/index.ts"),
    server.ssrLoadModule("/src/data/personality/repository.ts"),
    server.ssrLoadModule("/src/data/personality/element-profiles.ts"),
  ]);
  const profiles = await loadAllCharacterPersonalities();
  const answerSets = [0, 1, 2, 3].map((answerIndex) => Object.fromEntries(questions.map((question) => [question.id, question.answers[answerIndex % question.answers.length].id])));

  for (const answers of answerSets) {
    const profile = engine.buildUserPersonalityProfile(answers, questions);
    assert(Object.values(profile.dimensions).every((value) => value >= 0 && value <= 100), "Dimension score is outside 0–100");
    assert(Object.values(profile.traits).every((value) => value >= 0 && value <= 1), "Trait score is outside 0–1");
    const characters = engine.rankCharacterMatches(profile, profiles);
    const visions = engine.rankVisionAffinities(profile, elementProfiles);
    assert(characters.length === profiles.length, "Character ranking is incomplete");
    assert(visions.length === 7, "Vision ranking is incomplete");
    assert(characters.every(({ compatibility }) => compatibility >= 0 && compatibility <= 100), "Compatibility is outside 0–100");
    assert(characters.every(({ matchingTraitIds }) => matchingTraitIds.length > 0), "A character match has no matching-trait explanation");
    assert(visions.every(({ affinity }) => affinity >= 0 && affinity <= 100), "Affinity is outside 0–100");
    const repeated = engine.rankCharacterMatches(profile, [...profiles].reverse());
    assert(characters.map(({ characterId }) => characterId).join() === repeated.map(({ characterId }) => characterId).join(), "Character ranking depends on input order");
  }

  const outward = engine.buildUserPersonalityProfile(answerSets[0], questions);
  const inward = engine.buildUserPersonalityProfile(answerSets[3], questions);
  assert(outward.dimensions.social > inward.dimensions.social, "Social scoring direction is reversed");
  assert(outward.dimensions.expression > inward.dimensions.expression, "Expression scoring direction is reversed");

  let rejectedIncomplete = false;
  try { engine.buildUserPersonalityProfile({}, questions); } catch { rejectedIncomplete = true; }
  assert(rejectedIncomplete, "Incomplete answers were not rejected");

  console.log(`Engine verification passed: ${answerSets.length} deterministic answer sets across ${profiles.length} characters and ${elementProfiles.length} elements.`);
} finally {
  await server.close();
}
