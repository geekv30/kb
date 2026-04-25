#!/usr/bin/env node
// One-off Storybook screenshot script for the Phase 7 diff audit.
// Captures each requested story id at 1280x900 against localhost:6006 and
// writes PNGs into /tmp/storybook-captures/.

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const STORYBOOK = 'http://localhost:6006';
const OUT_DIR = '/tmp/storybook-captures';

const STORIES = [
  // Card primitive
  ['card-default', 'components-primitives-card--default', 600, 400],

  // Stat row
  ['stat-card-default', 'components-content-stat-card--default', 400, 200],
  ['stat-card-down', 'components-content-stat-card--down', 400, 200],
  ['stat-card-grid-support', 'components-content-stat-card-grid--support-performance', 1000, 240],
  ['stat-card-grid-ai-search', 'components-content-stat-card-grid--ai-search-performance', 1000, 240],

  // Date pill
  ['date-pill-default', 'components-content-date-range-pill--default-7-d', 400, 200],
  ['date-pill-interactive', 'components-content-date-range-pill--interactive', 400, 200],

  // Charts (atoms)
  ['area-chart-two-series', 'components-content-analytics-area-chart--two-series', 1000, 400],
  ['area-chart-one-positive', 'components-content-analytics-area-chart--one-series-positive', 1000, 400],
  ['area-chart-with-goal', 'components-content-analytics-area-chart--with-goal-line', 1000, 400],
  ['donut-chart-default', 'components-content-analytics-donut-chart--default', 600, 400],
  ['donut-chart-no-legend', 'components-content-analytics-donut-chart--without-legend', 400, 400],

  // Charts (composed)
  ['chart-card-with-chart', 'components-content-analytics-chart-card--with-chart', 1000, 480],
  ['chart-card-with-goal', 'components-content-analytics-chart-card--with-goal-line', 1000, 480],
  ['chart-card-with-donut', 'components-content-analytics-chart-card--with-donut', 800, 480],

  // Helpfulness
  ['helpfulness-up', 'components-content-helpfulness-tag--up', 400, 200],
  ['helpfulness-down', 'components-content-helpfulness-tag--down', 400, 200],

  // Tables
  ['table-articles-needs-attention', 'components-content-articles-needs-attention-table--default', 600, 500],
  ['table-article-performance', 'components-content-article-performance-table--default', 1000, 500],
  ['table-search-keywords', 'components-content-search-keywords-table--default', 1000, 500],
  ['table-content-gaps', 'components-content-content-gaps-table--default', 1000, 800],
  ['table-most-cited', 'components-content-most-cited-articles-table--default', 1000, 500],

  // Conversation logs
  ['convlog-default', 'components-content-ai-conversation-log-entry--default', 1000, 300],
  ['convlog-with-ticket', 'components-content-ai-conversation-log-entry--with-ticket-created', 1000, 350],
  ['convlog-with-followup', 'components-content-ai-conversation-log-entry--with-follow-up', 1000, 500],
  ['convlog-negative', 'components-content-ai-conversation-log-entry--negative', 1000, 300],
  ['convlog-card-default', 'components-content-ai-conversation-logs-card--default', 1000, 1300],

  // Side nav
  ['sidenav-default', 'components-navigation-analytics-side-nav--default', 400, 700],
  ['sidenav-article-active', 'components-navigation-analytics-side-nav--article-active', 400, 700],

  // Page patterns (fullscreen)
  ['page-article-perf', 'patterns-kb-analytics-article-performance--default', 1280, 1700],
  ['page-search', 'patterns-kb-analytics-search--default', 1280, 1900],
  ['page-ai-answer', 'patterns-kb-analytics-ai-answer-performance--default', 1280, 2700],
];

await mkdir(OUT_DIR, { recursive: true });
const browser = await chromium.launch({ headless: true });
let ok = 0;
let fail = 0;
const start = Date.now();

for (const [name, id, width, height] of STORIES) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 2,
  });
  const page = await ctx.newPage();
  const url = `${STORYBOOK}/iframe.html?args=&id=${id}&viewMode=story`;
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    // Charts and conversation logs need an extra moment for Recharts/animations
    await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT_DIR}/${name}.png`, fullPage: false });
    process.stdout.write(`✓ ${name}\n`);
    ok++;
  } catch (e) {
    process.stdout.write(`✗ ${name} — ${e.message}\n`);
    fail++;
  }
  await ctx.close();
}

await browser.close();
const ms = Date.now() - start;
process.stdout.write(`\nDone — ${ok} captured, ${fail} failed in ${(ms / 1000).toFixed(1)}s. Output: ${OUT_DIR}\n`);
