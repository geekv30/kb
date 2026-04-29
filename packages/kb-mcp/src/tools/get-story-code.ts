// MCP tool: get_story_code
//
// Returns the FULL source of a kb-ui .stories.tsx file, looked up by the
// Storybook title in the story's `meta.title` (e.g.
// "Patterns/AI Optimisation/AI Optimise Hub" or
// "Components/Layout/AppShell").
//
// Backed by the pre-built `StoriesIndex` so the tool works in both
// workspace and npm-install modes (issue #28).

import { z } from 'zod';

import type { StoriesIndex } from '../index/stories-index.js';

export const getStoryCodeInputSchema = z.object({
  storyTitle: z
    .string()
    .min(1)
    .describe(
      'The exact `meta.title` string from the story file (e.g. "Patterns/Knowledge Base/Category Page", "Components/Navigation/Side Nav Rail").',
    ),
});

export type GetStoryCodeInput = z.infer<typeof getStoryCodeInputSchema>;

export type GetStoryCodeOutput = {
  storyTitle: string;
  filePath: string;
  source: string;
};

export async function getStoryCode(
  storiesIndex: StoriesIndex,
  input: GetStoryCodeInput,
): Promise<GetStoryCodeOutput> {
  const entry = storiesIndex.get(input.storyTitle);
  if (entry) {
    return {
      storyTitle: entry.title,
      filePath: entry.filePath,
      source: entry.source,
    };
  }

  // Helpful error: list a few known titles so the caller can correct itself.
  const candidates = Array.from(storiesIndex.keys());
  throw new Error(
    `Story title "${input.storyTitle}" not found among ${candidates.length} story files. Known titles include: ${candidates.slice(0, 8).join(' | ')}${candidates.length > 8 ? ' | …' : ''}.`,
  );
}
