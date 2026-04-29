// @hiver/kb-mcp — MCP companion server for @hiver/kb-ui
//
// Stdio transport. Issue #9 (Phase 9.3) wires up the Tier 1 toolkit:
//   - list_components       (filter by category)
//   - get_component_spec    (single component, full props/Figma/etc.)
//   - list_tokens           (filter by tokens.css section)
//   - get_token_value       (CSS or dotted JS form)
//   - get_story_code        (full source by Storybook title)
// plus one MCP resource:
//   - kb://design/overview  (full text of design.md)
//
// Indices for components/tokens are built ONCE at startup from the
// workspace install of @hiver/kb-ui (issue #8 module). The server
// is read-only; no caching beyond the in-memory indices.
//
// Run locally for development:
//   npm run --workspace=packages/kb-mcp build
//   node packages/kb-mcp/dist/index.js
//
// Or wired into Claude Code / Desktop / Cursor via the JSON config
// shipped in #11's README.

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import type { ZodTypeAny } from 'zod';

import { buildComponentIndex } from './index/component-index.js';
import { buildTokenIndex } from './index/token-index.js';
import {
  listComponents,
  listComponentsInputSchema,
} from './tools/list-components.js';
import {
  getComponentSpec,
  getComponentSpecInputSchema,
} from './tools/get-component-spec.js';
import { listTokens, listTokensInputSchema } from './tools/list-tokens.js';
import {
  getTokenValue,
  getTokenValueInputSchema,
} from './tools/get-token-value.js';
import {
  getStoryCode,
  getStoryCodeInputSchema,
} from './tools/get-story-code.js';
import {
  recommendComponentsForPrd,
  recommendComponentsForPrdInputSchema,
} from './tools/recommend-components-for-prd.js';
import {
  DESIGN_OVERVIEW_MIME,
  DESIGN_OVERVIEW_NAME,
  DESIGN_OVERVIEW_URI,
  readDesignOverview,
} from './resources/design-overview.js';

/* ─────────────────────────────────────────────────────────────
 * Path resolution: kb-ui src root + repo root
 * ─────────────────────────────────────────────────────────────
 *
 * `require.resolve('@hiver/kb-ui')` returns the `main` entry —
 * `.../packages/kb-ui/dist/index.js` in workspace mode. We walk up to
 * the package directory (containing `package.json`), then into `src/`
 * for story-file scans. The repo root is two levels above the package
 * (packages/kb-ui → packages → repo).
 */
const require = createRequire(import.meta.url);

function resolveKbUiPaths(): { kbUiPkgDir: string; kbUiSrcRoot: string; repoRoot: string } {
  const kbUiMain = require.resolve('@hiver/kb-ui');
  let kbUiPkgDir = dirname(kbUiMain);
  // Walk up until we find a package.json. Bounded loop for safety.
  for (let i = 0; i < 5; i += 1) {
    if (existsSync(resolve(kbUiPkgDir, 'package.json'))) break;
    const parent = dirname(kbUiPkgDir);
    if (parent === kbUiPkgDir) {
      throw new Error('Could not locate @hiver/kb-ui package root.');
    }
    kbUiPkgDir = parent;
  }
  const kbUiSrcRoot = resolve(kbUiPkgDir, 'src');
  if (!existsSync(kbUiSrcRoot)) {
    throw new Error(
      `@hiver/kb-ui src/ not found at ${kbUiSrcRoot}. kb-mcp currently requires the workspace install (issue #8 scope).`,
    );
  }
  // Workspace layout: <repo>/packages/kb-ui — repo is two levels up.
  const repoRoot = resolve(kbUiPkgDir, '..', '..');
  return { kbUiPkgDir, kbUiSrcRoot, repoRoot };
}

const { kbUiSrcRoot, repoRoot } = resolveKbUiPaths();

/* ─────────────────────────────────────────────────────────────
 * Build indices once at startup.
 * ───────────────────────────────────────────────────────────── */
const componentIndex = buildComponentIndex();
const tokenIndex = buildTokenIndex();

/* ─────────────────────────────────────────────────────────────
 * Tool registry
 * ─────────────────────────────────────────────────────────────
 *
 * Each entry pairs the tool's MCP descriptor (name, description,
 * input schema) with the function that runs it. The CallTool
 * dispatcher below validates `params.arguments` against the Zod
 * schema, runs the handler, and JSON-stringifies the result into
 * an MCP `text` content block.
 */
type ToolEntry = {
  name: string;
  description: string;
  inputSchema: ZodTypeAny;
  handler: (args: unknown) => unknown | Promise<unknown>;
};

const tools: ToolEntry[] = [
  {
    name: 'list_components',
    description:
      'List every kb-ui component, optionally filtered by category (folder under src/components/, e.g. "nav", "shell", "content"). Returns name, category, one-line description, and source path for each.',
    inputSchema: listComponentsInputSchema,
    handler: (args) => {
      const parsed = listComponentsInputSchema.parse(args ?? {});
      return listComponents(componentIndex, parsed);
    },
  },
  {
    name: 'get_component_spec',
    description:
      'Get the full ComponentSpec for a single kb-ui component (props, story files, Figma node, import statement). Pass the exported component name (e.g. "KBBreadcrumbBar"). Case-sensitive.',
    inputSchema: getComponentSpecInputSchema,
    handler: (args) => {
      const parsed = getComponentSpecInputSchema.parse(args ?? {});
      return getComponentSpec(componentIndex, parsed);
    },
  },
  {
    name: 'list_tokens',
    description:
      'List every kb-ui design token, optionally filtered by category (section in tokens.css, e.g. "Surfaces", "Text", "Spacing"). Returns name, value, and category.',
    inputSchema: listTokensInputSchema,
    handler: (args) => {
      const parsed = listTokensInputSchema.parse(args ?? {});
      return listTokens(tokenIndex, parsed);
    },
  },
  {
    name: 'get_token_value',
    description:
      'Resolve a single kb-ui design token. Accepts either CSS form ("--color-canvas") or dotted JS path ("color.canvas"). Returns the full TokenSpec.',
    inputSchema: getTokenValueInputSchema,
    handler: (args) => {
      const parsed = getTokenValueInputSchema.parse(args ?? {});
      return getTokenValue(tokenIndex, parsed);
    },
  },
  {
    name: 'get_story_code',
    description:
      'Return the full source of a kb-ui .stories.tsx file, looked up by the Storybook title in `meta.title` (e.g. "Patterns/Knowledge Base/Category Page", "Components/Navigation/Side Nav Rail").',
    inputSchema: getStoryCodeInputSchema,
    handler: async (args) => {
      const parsed = getStoryCodeInputSchema.parse(args ?? {});
      return getStoryCode(kbUiSrcRoot, parsed);
    },
  },
  {
    name: 'recommend_components_for_prd',
    description:
      'Turn a plain-English PRD into a starting composition: top 3–7 kb-ui components that match (with one-line reasons), the closest matching pattern story (full source), and a hand-curated composition snippet wiring the picks into an AppShell.',
    inputSchema: recommendComponentsForPrdInputSchema,
    handler: async (args) => {
      const parsed = recommendComponentsForPrdInputSchema.parse(args ?? {});
      return recommendComponentsForPrd(componentIndex, parsed, { kbUiSrcRoot });
    },
  },
];

const toolByName = new Map<string, ToolEntry>(tools.map((t) => [t.name, t]));

/* ─────────────────────────────────────────────────────────────
 * Server setup + request handlers
 * ───────────────────────────────────────────────────────────── */

const server = new Server(
  {
    name: '@hiver/kb-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  },
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
      // zodToJsonSchema returns an object — the MCP Tool schema expects
      // `{ type: "object", properties: ..., required: ... }`. Strip any
      // top-level `$schema` for a cleaner envelope.
      inputSchema: (() => {
        const json = zodToJsonSchema(t.inputSchema, {
          $refStrategy: 'none',
          target: 'jsonSchema7',
        }) as Record<string, unknown>;
        delete json.$schema;
        return json;
      })(),
    })),
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const entry = toolByName.get(name);
  if (!entry) {
    throw new McpError(
      ErrorCode.MethodNotFound,
      `Unknown tool "${name}". Known tools: ${tools.map((t) => t.name).join(', ')}.`,
    );
  }
  try {
    const result = await entry.handler(args);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (err) {
    // Tool handler / Zod validation failures surface to the client as a
    // tool-result with `isError: true`. Reserved transport-level errors
    // (McpError) are re-thrown so the SDK formats them as JSON-RPC errors.
    if (err instanceof McpError) throw err;
    const message = err instanceof Error ? err.message : String(err);
    return {
      content: [{ type: 'text', text: message }],
      isError: true,
    };
  }
});

server.setRequestHandler(ListResourcesRequestSchema, async () => {
  return {
    resources: [
      {
        uri: DESIGN_OVERVIEW_URI,
        name: DESIGN_OVERVIEW_NAME,
        mimeType: DESIGN_OVERVIEW_MIME,
        description:
          'Full text of the kb-ui design system spec (design.md): tokens, typography, spacing, component-by-component Figma references.',
      },
    ],
  };
});

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;
  if (uri !== DESIGN_OVERVIEW_URI) {
    throw new McpError(
      ErrorCode.InvalidParams,
      `Unknown resource URI "${uri}". Known: ${DESIGN_OVERVIEW_URI}.`,
    );
  }
  const { mimeType, text } = await readDesignOverview(repoRoot);
  return {
    contents: [
      {
        uri,
        mimeType,
        text,
      },
    ],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
