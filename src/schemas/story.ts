import { z } from "zod";

import { DIMENSION_IDS, TRAIT_IDS, type StoryChapter } from "../types";
import { localizedTextSchema } from "./index";

const knownDimensionIds = new Set<string>(DIMENSION_IDS);
const knownTraitIds = new Set<string>(TRAIT_IDS);

const storyDimensionScoreSchema = z.record(z.string(), z.number().int().min(-3).max(3)).superRefine((value, context) => {
  for (const key of Object.keys(value)) {
    if (!knownDimensionIds.has(key)) context.addIssue({ code: z.ZodIssueCode.custom, message: `Unknown dimension id: ${key}` });
  }
});
const storyTraitScoreSchema = z.record(z.string(), z.number().min(0).max(1)).superRefine((value, context) => {
  for (const key of Object.keys(value)) {
    if (!knownTraitIds.has(key)) context.addIssue({ code: z.ZodIssueCode.custom, message: `Unknown trait id: ${key}` });
  }
});

const storyChoiceSchema = z.object({
  id: z.string().min(1),
  text: localizedTextSchema,
  nextNodeId: z.string().min(1),
  scores: z.object({ dimensions: storyDimensionScoreSchema, traits: storyTraitScoreSchema }),
});

const storyNodeSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["story", "choice", "ending"]),
  content: localizedTextSchema,
  speaker: localizedTextSchema.optional(),
  background: z.string().optional(),
  characterImage: z.string().optional(),
  music: z.string().optional(),
  choices: z.array(storyChoiceSchema).optional(),
  nextNodeId: z.string().min(1).optional(),
});

const storyEndingSchema = z.object({
  id: z.string().min(1),
  title: localizedTextSchema,
  epilogue: localizedTextSchema,
});

export const storyChapterSchema = z.object({
  id: z.string().min(1),
  title: localizedTextSchema,
  description: localizedTextSchema,
  startNodeId: z.string().min(1),
  nodes: z.array(storyNodeSchema).min(1),
  endings: z.array(storyEndingSchema).min(1),
});

function duplicateIds(values: Array<{ id: string }>) {
  const seen = new Set<string>();
  return values.filter(({ id }) => seen.has(id) || !seen.add(id)).map(({ id }) => id);
}

export function validateStoryChapters(input: StoryChapter[]) {
  const chapters = z.array(storyChapterSchema).min(1).parse(input);
  const duplicateChapterIds = duplicateIds(chapters);
  if (duplicateChapterIds.length) throw new Error(`Duplicate story chapter ids: ${duplicateChapterIds.join(", ")}`);

  for (const chapter of chapters) {
    const duplicateNodeIds = duplicateIds(chapter.nodes);
    if (duplicateNodeIds.length) throw new Error(`${chapter.id}: duplicate node ids: ${duplicateNodeIds.join(", ")}`);

    const duplicateEndingIds = duplicateIds(chapter.endings);
    if (duplicateEndingIds.length) throw new Error(`${chapter.id}: duplicate ending ids: ${duplicateEndingIds.join(", ")}`);

    const nodeIds = new Set(chapter.nodes.map((node) => node.id));
    if (!nodeIds.has(chapter.startNodeId)) throw new Error(`${chapter.id}: startNodeId does not exist: ${chapter.startNodeId}`);

    for (const node of chapter.nodes) {
      if (node.type === "choice" && !node.choices?.length) throw new Error(`${chapter.id}/${node.id}: choice node needs at least one choice`);
      if (node.type === "ending" && node.nextNodeId) throw new Error(`${chapter.id}/${node.id}: ending node must not have nextNodeId`);
      if (node.type === "story" && !node.nextNodeId) throw new Error(`${chapter.id}/${node.id}: story node must have nextNodeId`);
      if (node.nextNodeId && !nodeIds.has(node.nextNodeId)) throw new Error(`${chapter.id}/${node.id}: nextNodeId does not exist: ${node.nextNodeId}`);
      for (const choiceOption of node.choices ?? []) {
        if (!nodeIds.has(choiceOption.nextNodeId)) throw new Error(`${chapter.id}/${node.id}/${choiceOption.id}: nextNodeId does not exist: ${choiceOption.nextNodeId}`);
      }
    }
  }

  return chapters;
}
