import { createServer } from "vite";

const server = await createServer({
  root: process.cwd(),
  appType: "custom",
  server: { middlewareMode: true, hmr: false },
  logLevel: "error",
});

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const sampleCharacter = {
  characterId: "kirara",
  name: "Kirara",
  element: "Dendro",
  region: "Inazuma",
  compatibility: 87,
  title: { th: "นักส่งพัสดุ", en: "The Postal Courier" },
  summary: { th: "สรุปตัวละคร", en: "Character summary" },
  matchingTraits: [{ th: "ขยัน", en: "Diligent" }],
  matchingTraitIds: ["diligent"],
  artworkUrl: undefined,
};
const sampleVision = {
  element: "Dendro",
  affinity: 91,
  summary: { th: "สรุปธาตุ", en: "Vision summary" },
};
const sampleVersions = { questionVersion: "q3", algorithmVersion: "a1" };

try {
  const sharedResult = await server.ssrLoadModule("/src/lib/shared-result.ts");

  const snapshot = sharedResult.buildSharedResultDoc(sampleCharacter, sampleVision, sampleVersions);
  assert(snapshot.schemaVersion === 1, "schemaVersion must be 1");
  assert(snapshot.questionVersion === "q3" && snapshot.algorithmVersion === "a1", "version fields must pass through untouched");
  assert(snapshot.character.characterId === "kirara" && snapshot.character.compatibility === 87, "character snapshot must carry core fields");
  assert(snapshot.character.artworkUrl === null, "a missing artworkUrl must coerce to null, not undefined");
  assert(Array.isArray(snapshot.character.matchingTraits) && snapshot.character.matchingTraits[0].en === "Diligent", "matchingTraits must pass through");
  assert(snapshot.vision.element === "Dendro" && snapshot.vision.affinity === 91, "vision snapshot must carry core fields");

  const ids = new Set(Array.from({ length: 50 }, () => sharedResult.createSharedResultId()));
  assert(ids.size === 50, "createSharedResultId must not collide across 50 calls");
  assert([...ids].every((id) => /^[A-Za-z0-9_-]{12}$/.test(id)), "createSharedResultId must match the URL-safe 12-character pattern");

  console.log("Shared result mapper verification passed.");
} finally {
  await server.close();
}
