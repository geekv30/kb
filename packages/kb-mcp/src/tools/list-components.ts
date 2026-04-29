// MCP tool: list_components
//
// Returns every kb-ui component, optionally filtered by category
// (folder name under src/components/). One-line description per entry.

import { z } from 'zod';
import type { ComponentIndex } from '../index/types.js';

export const listComponentsInputSchema = z.object({
  category: z
    .string()
    .optional()
    .describe(
      'Filter by category (folder under src/components/, e.g. "nav", "shell", "content"). Omit to return all.',
    ),
});

export type ListComponentsInput = z.infer<typeof listComponentsInputSchema>;

export type ListComponentsOutputEntry = {
  name: string;
  category: string;
  oneLineDescription: string | null;
  filePath: string;
};

export function listComponents(
  index: ComponentIndex,
  input: ListComponentsInput,
): ListComponentsOutputEntry[] {
  const filter = input.category?.toLowerCase();
  return Array.from(index.values())
    .filter((c) => !filter || c.category.toLowerCase() === filter)
    .map((c) => ({
      name: c.name,
      category: c.category,
      oneLineDescription: c.description,
      filePath: c.filePath,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}
