import type { StoryChapter, StoryNode } from "../../types";

import { chapter01, selectStoryEnding } from "./chapter-01";

export const chapters: StoryChapter[] = [chapter01];
export const chapterById = new Map(chapters.map((chapter) => [chapter.id, chapter]));
export const nodeById = new Map<string, StoryNode>(chapters.flatMap((chapter) => chapter.nodes.map((node) => [node.id, node])));

export { chapter01, selectStoryEnding };
