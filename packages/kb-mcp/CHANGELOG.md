# @test-kb-ui/kb-mcp changelog

## 1.1.0 — 2026-04-29

Added: product-context surface so Claude can scope a PRD before reaching for components.

- New tool `find_relevant_journey` — given a PRD, returns the matching user journey (Browse & Edit, AI Optimise Review, or Analytics Drill) with entry point, landing page, key components, and confidence.
- New resources: `kb://product/journeys`, `kb://product/information-architecture`, `kb://product/feature-map`. Concise markdown summaries of the product's user journeys, IA, and current capability map.
- Tool descriptions updated to nudge clients toward scope-first conversation: call `find_relevant_journey` before `recommend_components_for_prd`, read product resources for grounding.
- README example replaced with a conversational scope → confirm → compose flow.

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
