// @hiver/kb-mcp — MCP companion server for @hiver/kb-ui
//
// Stdio transport. Issue #7 (Phase 9.1) ships the bare server
// bootstrap only — tools and resources are registered in #8/#9/#10.
//
// Run locally for development:
//   npm run --workspace=packages/kb-mcp build
//   node packages/kb-mcp/dist/index.js
//
// Or wired into Claude Code / Desktop / Cursor via the JSON config
// shipped in #11's README.

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

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

const transport = new StdioServerTransport();
await server.connect(transport);
