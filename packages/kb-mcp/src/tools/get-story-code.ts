// MCP tool: get_story_code
//
// Returns the FULL source of a kb-ui .stories.tsx file, looked up by the
// Storybook title in the story's `meta.title` (e.g.
// "Patterns/AI Optimisation/AI Optimise Hub" or
// "Components/Layout/AppShell").
//
// Implementation: scan packages/kb-ui/src/**/*.stories.tsx for a matching
// `title:` literal. The repo has ~40 story files; a linear scan at request
// time is fine for v1.

import { z } from 'zod';
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

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

async function walkStoryFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const out: string[] = [];
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await walkStoryFiles(full)));
    } else if (e.isFile() && e.name.endsWith('.stories.tsx')) {
      out.push(full);
    }
  }
  return out;
}

export async function getStoryCode(
  kbUiSrcRoot: string,
  input: GetStoryCodeInput,
): Promise<GetStoryCodeOutput> {
  const storyFiles = await walkStoryFiles(kbUiSrcRoot);

  // Build a regex that matches `title: '<input>'`, `title: "<input>"`, or
  // `title: \`<input>\`` with optional surrounding whitespace. Escape user
  // input so regex metachars in the title (e.g. `/`, `.`) match literally.
  const escaped = input.storyTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const titleRegex = new RegExp(`title\\s*:\\s*['"\`]${escaped}['"\`]`);

  for (const filePath of storyFiles) {
    const source = await readFile(filePath, 'utf8');
    if (titleRegex.test(source)) {
      return { storyTitle: input.storyTitle, filePath, source };
    }
  }

  // Helpful error: list a few known titles so the caller can correct itself.
  const candidates: string[] = [];
  for (const filePath of storyFiles) {
    const source = await readFile(filePath, 'utf8');
    const match = source.match(/title\s*:\s*['"`]([^'"`]+)['"`]/);
    if (match) candidates.push(match[1]);
  }
  throw new Error(
    `Story title "${input.storyTitle}" not found among ${storyFiles.length} story files. Known titles include: ${candidates.slice(0, 8).join(' | ')}${candidates.length > 8 ? ' | …' : ''}.`,
  );
}
