// MCP tool: get_component_spec
//
// Returns the full ComponentSpec (props, story files, Figma node, import
// statement) for a single named component. Throws a clear not-found error
// (caller wraps it in an MCP error envelope) when the name doesn't match.

import { z } from 'zod';
import type { ComponentIndex, ComponentSpec } from '../index/types.js';

export const getComponentSpecInputSchema = z.object({
  name: z
    .string()
    .min(1)
    .describe(
      'Component name as exported (e.g. "KBBreadcrumbBar"). Case-sensitive.',
    ),
});

export type GetComponentSpecInput = z.infer<typeof getComponentSpecInputSchema>;

export function getComponentSpec(
  index: ComponentIndex,
  input: GetComponentSpecInput,
): ComponentSpec {
  const found = index.get(input.name);
  if (!found) {
    const known = Array.from(index.keys()).sort().slice(0, 10).join(', ');
    throw new Error(
      `Component "${input.name}" not found in @test-kb-ui/kb-ui. Known components include: ${known}${index.size > 10 ? ', …' : ''}.`,
    );
  }
  return found;
}
