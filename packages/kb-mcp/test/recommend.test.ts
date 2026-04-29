// Fixture tests for `recommend_components_for_prd` (issue #10 acceptance
// criteria), adapted to the current kb-ui export surface (post Phase 7.5
// consolidation: AnalyticsSideNav → FileExplorerNav, ArticlePerformanceTable
// and the 6 other dropped tables → DataTable).
//
// Run via:
//   npm run --workspace=packages/kb-mcp test
// or directly:
//   cd packages/kb-mcp && npx tsx --test test/**/*.test.ts

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildComponentIndex } from '../src/index/component-index.js';
import { recommendComponentsForPrd } from '../src/tools/recommend-components-for-prd.js';

const index = buildComponentIndex();

test('settings page for AI gap rules → AppShell + nav + Card + form primitives', async () => {
  const result = await recommendComponentsForPrd(index, {
    prd: 'I need a settings page where admins manage AI gap suggestion rules — a form with text inputs, dropdowns, and a save button, inside the standard app shell with the side navigation rail.',
  });
  const names = result.recommendedComponents.map((c) => c.name);
  assert.ok(
    names.includes('AppShell'),
    `expected AppShell in ${names.join(', ')}`,
  );
  assert.ok(
    names.includes('SideNavRail'),
    `expected SideNavRail in ${names.join(', ')}`,
  );
  assert.ok(
    names.includes('Button'),
    `expected Button in ${names.join(', ')}`,
  );
  // At least one of: TextInput, Dropdown, Card
  assert.ok(
    ['TextInput', 'Dropdown', 'Card'].some((n) => names.includes(n)),
    `expected one of TextInput/Dropdown/Card in ${names.join(', ')}`,
  );
});

test('analytics — most viewed articles last 30 days → StatCardGrid + DataTable + DateRangePill', async () => {
  const result = await recommendComponentsForPrd(index, {
    prd: 'Show analytics for which articles are most viewed in the last 30 days. Include a stat grid with totals at the top, a date range filter, and a table of articles ranked by views.',
  });
  const names = result.recommendedComponents.map((c) => c.name);
  assert.ok(
    names.includes('StatCardGrid'),
    `expected StatCardGrid in ${names.join(', ')}`,
  );
  assert.ok(
    names.includes('DataTable'),
    `expected DataTable in ${names.join(', ')}`,
  );
  assert.ok(
    names.includes('DateRangePill'),
    `expected DateRangePill in ${names.join(', ')}`,
  );
});

test('article editor with AI suggestions reviewed inline → editor + AI components', async () => {
  const result = await recommendComponentsForPrd(index, {
    prd: 'An article editor where AI suggestions can be reviewed inline as the user reads through the article body — accept or dismiss each suggestion, with conversation sources available in a side drawer.',
  });
  const names = result.recommendedComponents.map((c) => c.name);
  assert.ok(
    names.includes('AppShell'),
    `expected AppShell in ${names.join(', ')}`,
  );
  // Editor side
  assert.ok(
    ['ContentEditor', 'ArticleBody'].some((n) => names.includes(n)),
    `expected ContentEditor or ArticleBody in ${names.join(', ')}`,
  );
  // AI side
  assert.ok(
    ['AIGapSuggestionCard', 'AISuggestionsCard'].some((n) => names.includes(n)),
    `expected an AI suggestions component in ${names.join(', ')}`,
  );
  // Sources sheet
  assert.ok(
    names.includes('SourcesSideSheet'),
    `expected SourcesSideSheet in ${names.join(', ')}`,
  );
});
