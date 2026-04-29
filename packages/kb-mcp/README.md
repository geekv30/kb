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
| `list_components` | List every public kb-ui component (name + category + one-line description), optionally filtered by category. |
| `get_component_spec` | Full TypeScript prop spec, story files, Figma node, and import statement for one component. |
| `list_tokens` | List every design token in `tokens.css` (color, spacing, radius, typography, etc.), optionally filtered by section. |
| `get_token_value` | Resolve one token by CSS name (`--color-canvas`) or dotted JS path (`color.canvas`). |
| `get_story_code` | Return the full source of any pattern story by Storybook title (e.g. `Patterns/Knowledge Base/Category Page`). |
| `recommend_components_for_prd` | Headline tool. Turn a PRD into a starting composition: top 3-7 components with reasons, the closest pattern story, and a working composition snippet. |

The server also exposes a single MCP **resource**:

- `kb://design/overview` — full text of `design.md` (tokens, typography, spacing, per-component Figma references).

## Example interaction

You, in Claude Code:

> Build me an article editor for our knowledge base. The user should be able to edit an article body and see AI suggestions reviewed inline next to it.

Claude calls `recommend_components_for_prd` with that prompt. The tool returns a JSON envelope something like:

```jsonc
{
  "recommendedComponents": [
    { "name": "AppShell",            "why": "outer chrome (top bar + side nav)" },
    { "name": "KBBreadcrumbBar",     "why": "in-app breadcrumb above the editor" },
    { "name": "ContentEditor",       "why": "rich-text editor surface" },
    { "name": "ArticleBody",         "why": "rendered article preview" },
    { "name": "AIGapSuggestionCard", "why": "inline AI suggestion card" },
    { "name": "AISuggestionsCard",   "why": "list of AI-generated edits" },
    { "name": "SourcesSideSheet",    "why": "right-rail sources reviewer" }
  ],
  "suggestedPattern": { "storyTitle": "Patterns/Knowledge Base/Article Editor", "storySource": "..." },
  "compositionSnippet": "<AppShell> ... </AppShell>"
}
```

Claude then reads the snippet and the pattern story, and writes a real React file in your repo using those exports — no bespoke components, no hand-rolled chrome.

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
