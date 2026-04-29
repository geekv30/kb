# @test-kb-ui/kb-mcp

An [MCP](https://modelcontextprotocol.io) companion server for [`@test-kb-ui/kb-ui`](https://www.npmjs.com/package/@test-kb-ui/kb-ui). Point Claude (or any MCP client) at it and you can turn a plain-English PRD into a starting React composition built from real kb-ui components — with the matching pattern story, resolved design tokens, and a working composition snippet pulled straight from the library. The server is read-only and serves an in-memory index of every public component, every design token, and every Storybook pattern story shipped in kb-ui.

## Quickstart

Run on demand with `npx` (no install needed):

```bash
npx -y @test-kb-ui/kb-mcp
```

Or install globally:

```bash
npm install -g @test-kb-ui/kb-mcp
```

The server speaks MCP over stdio. You almost never run it directly — wire it into your editor or chat client using one of the configs below.

## Configure your MCP client

### Claude Code

Edit `~/.claude/mcp_servers.json`:

```jsonc
{
  "mcpServers": {
    "test-kb-ui": {
      "command": "npx",
      "args": ["-y", "@test-kb-ui/kb-mcp"]
    }
  }
}
```

Restart Claude Code. The 6 tools below should appear in the tool list.

### Claude Desktop

Same JSON shape. Edit:

- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```jsonc
{
  "mcpServers": {
    "test-kb-ui": {
      "command": "npx",
      "args": ["-y", "@test-kb-ui/kb-mcp"]
    }
  }
}
```

Quit and reopen Claude Desktop after editing.

### Cursor

Open Cursor, go to **Settings -> MCP**, then **Add new server** and fill in:

- Name: `test-kb-ui`
- Command: `npx`
- Args: `["-y", "@test-kb-ui/kb-mcp"]`

If you prefer editing the config file directly, the same JSON shape used by Claude Desktop works in Cursor's MCP config.

## Tool reference

| Tool | What it does |
| --- | --- |
| `find_relevant_journey` | Scope a PRD to one of the 3 user journeys (Browse & Edit, AI Optimise Review, Analytics Drill). Returns entry point, landing page, key components, and confidence. **Call this first** — it grounds component recommendations in product context. |
| `list_components` | List every public kb-ui component (name + category + one-line description), optionally filtered by category. |
| `get_component_spec` | Full TypeScript prop spec, story files, Figma node, and import statement for one component. |
| `list_tokens` | List every design token in `tokens.css` (color, spacing, radius, typography, etc.), optionally filtered by section. |
| `get_token_value` | Resolve one token by CSS name (`--color-canvas`) or dotted JS path (`color.canvas`). |
| `get_story_code` | Return the full source of any pattern story by Storybook title (e.g. `Patterns/Knowledge Base/Category Page`). |
| `recommend_components_for_prd` | Turn a PRD into a starting composition: top 3-7 components with reasons, the closest pattern story, and a working composition snippet. Best used after `find_relevant_journey` + reading the relevant `kb://product/*` resources. |

The server also exposes MCP **resources**:

| Resource | Contents |
| --- | --- |
| `kb://design/overview` | Full text of `design.md` — tokens, typography, spacing, per-component Figma references. |
| `kb://product/journeys` | The 3 primary user journeys with personas, entry points, and where new features attach. |
| `kb://product/information-architecture` | Sitemap, top-level rail sections, sub-nav per section, shell modes, per-route component composition. |
| `kb://product/feature-map` | What the product does today by capability area, plus a list of common asks NOT yet built. |

## Example interaction (scope first, then components)

You, in Claude Code:

> I want to add a date range filter to analytics — last 7, 30, 90 days, custom.

Claude calls `find_relevant_journey` first. It returns:

```jsonc
{
  "bestMatch": {
    "name": "Analytics Drill",
    "entryPoint": "Rail \"Analytics\" icon -> /analytics/...",
    "landingPage": "One of 3 tabs: /analytics/article-performance, /analytics/search, /analytics/ai-answer-performance",
    "keyComponents": ["DateRangePill", "PageHeader", "StatCardGrid", "..."],
    "confidence": "high"
  },
  "guidance": "Strong match for \"Analytics Drill\". Read `kb://product/journeys` for the full journey detail, then confirm scope with the user before recommending components."
}
```

Claude reads `kb://product/journeys` + `kb://product/feature-map` and sees that `DateRangePill` already exists but is currently a no-op. It comes back to you:

> This lands on all 3 analytics tabs. The `DateRangePill` component is already in the design system — it's currently a no-op. We'd wire it to filter state. Should the filter persist across tabs, or reset per tab?

You answer. Once scope is confirmed, Claude calls `recommend_components_for_prd` for the actual composition snippet, reads the matching pattern story, and writes a real React file using kb-ui exports — no bespoke chrome.

The MCP doesn't enforce this flow. Claude reasons over the tools and resources naturally. The `find_relevant_journey` tool + `kb://product/*` resources just give Claude enough context to scope before reaching for code.

## Troubleshooting

- **Tools don't show up.** Restart your MCP client (Claude Code, Claude Desktop, or Cursor) after editing the config. MCP servers are launched at client startup.
- **Verify the server actually runs.** Use the official MCP inspector:
  ```bash
  npx @modelcontextprotocol/inspector npx @test-kb-ui/kb-mcp
  ```
- **Confirm the package is on the registry.**
  ```bash
  npm view @test-kb-ui/kb-mcp
  ```
- **Stale `npx` cache.** If a new release isn't picked up, `npm cache clean --force` and try again.

---

Source: <https://github.com/geekv30/kb>
