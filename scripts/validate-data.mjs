import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createServer } from "vite";

const root = process.cwd();
const server = await createServer({ root, appType: "custom", server: { middlewareMode: true, hmr: false }, logLevel: "error" });

try {
  const [{ questions }, { traits }, { loadAllCharacterPersonalities }, { elementProfiles }, schemas] = await Promise.all([
    server.ssrLoadModule("/src/data/quiz/questions.ts"),
    server.ssrLoadModule("/src/data/personality/traits.ts"),
    server.ssrLoadModule("/src/data/personality/repository.ts"),
    server.ssrLoadModule("/src/data/personality/element-profiles.ts"),
    server.ssrLoadModule("/src/schemas/index.ts"),
  ]);
  const profiles = await loadAllCharacterPersonalities();
  schemas.validateP0QuizData({ questions, traits, profiles });
  schemas.validateElementProfiles(elementProfiles);

  const characterIndex = JSON.parse(await readFile(path.join(root, "src/data/characters/_characters.json"), "utf8"));
  const loreIndex = JSON.parse(await readFile(path.join(root, "src/data/lore/_characters.json"), "utf8"));
  const canonicalIds = characterIndex.map(({ id }) => id);
  const assertUnique = (values, label) => {
    const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
    if (duplicates.length) throw new Error(`${label} has duplicate ids: ${[...new Set(duplicates)].join(", ")}`);
  };
  assertUnique(canonicalIds, "Character index");
  assertUnique(loreIndex.map(({ id }) => id), "Lore index");
  if (profiles.length !== canonicalIds.length) throw new Error(`Personality coverage is ${profiles.length}/${canonicalIds.length}`);
  if (loreIndex.length !== canonicalIds.length || loreIndex.some(({ id }) => !canonicalIds.includes(id))) throw new Error("Lore index does not match the canonical character index");

  for (const directory of ["src/data/characters", "src/data/lore", "src/data/personality/character-personalities"]) {
    const fileNames = (await readdir(path.join(root, directory))).filter((name) => name.endsWith(".json") && !name.startsWith("_"));
    const fileIds = fileNames.map((name) => path.basename(name, ".json"));
    const missing = canonicalIds.filter((id) => !fileIds.includes(id));
    if (missing.length) throw new Error(`${directory} is missing: ${missing.join(", ")}`);
    for (const fileName of fileNames) {
      const value = JSON.parse(await readFile(path.join(root, directory, fileName), "utf8"));
      const expectedId = path.basename(fileName, ".json");
      if (value.id !== expectedId) throw new Error(`${directory}/${fileName} has mismatched id: ${value.id}`);
    }
  }

  const elementTraitIds = new Set(elementProfiles.flatMap(({ personalityTheme }) => Object.keys(personalityTheme.traits)));
  const primaryTraitIds = new Set(elementProfiles.map(({ personalityTheme }) => personalityTheme.primary));
  const traitQuestionCounts = new Map();
  for (const question of questions) {
    const referenced = new Set(question.answers.flatMap(({ scores }) => Object.keys(scores.traits)));
    for (const traitId of referenced) traitQuestionCounts.set(traitId, (traitQuestionCounts.get(traitId) ?? 0) + 1);
  }
  const uncovered = [...elementTraitIds].filter((traitId) => !traitQuestionCounts.has(traitId));
  if (uncovered.length) throw new Error(`Element traits without question coverage: ${uncovered.join(", ")}`);
  const weakPrimaryCoverage = [...primaryTraitIds].filter((traitId) => (traitQuestionCounts.get(traitId) ?? 0) < 2);
  if (weakPrimaryCoverage.length) throw new Error(`Primary element traits need coverage in at least two questions: ${weakPrimaryCoverage.join(", ")}`);

  console.log(`Data validation passed: ${questions.length} questions, ${traits.length} traits, ${profiles.length} characters, ${elementProfiles.length} elements.`);
} finally {
  await server.close();
}
