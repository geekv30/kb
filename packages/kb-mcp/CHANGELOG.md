# @test-kb-ui/kb-mcp changelog

## 1.0.1 — 2026-04-29

Fix: server crashed on startup when installed from npm (workspace-only previously).

- Component, token, and Storybook-pattern indices are now pre-computed at package-build time and shipped as `dist/component-index.json`, `dist/token-index.json`, `dist/stories-index.json`.
- Runtime loaders (`loadComponentIndex`, `loadTokenIndex`, `loadStoriesIndex`) read the bundled JSON; no `node_modules` walk for kb-ui sources at startup.
- `npx -y @test-kb-ui/kb-mcp` now works in any fresh directory — Claude Code plugin install, Claude Desktop config, Cursor MCP setup all unblocked.

## 1.0.0 — 2026-04-29

Initial release.

- 6 tools: `list_components`, `get_component_spec`, `list_tokens`, `get_token_value`, `get_story_code`, `recommend_components_for_prd`.
- 1 resource: `kb://design/overview` (full text of `design.md`).
- stdio transport; binary `kb-mcp`.
