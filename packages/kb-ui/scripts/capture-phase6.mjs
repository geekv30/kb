#!/usr/bin/env node
// One-off Storybook screenshot script for the Phase 6 + earlier diff audit.
// Captures representative stories at appropriate viewports and writes PNGs
// to /tmp/storybook-captures/phase6/.

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const STORYBOOK = 'http://localhost:6006';
const OUT_DIR = '/tmp/storybook-captures/phase6';

const STORIES = [
  // AI Gap rail cards
  ['gap-active-addition', 'components-content-ai-gap-suggestion-card--active-addition', 480, 280],
  ['gap-active-replace', 'components-content-ai-gap-suggestion-card--active-replace', 480, 280],
  ['gap-active-removal', 'components-content-ai-gap-suggestion-card--active-removal', 480, 280],
  ['gap-accepted-addition', 'components-content-ai-gap-suggestion-card--accepted-addition', 480, 120],
  ['gap-dismissed-replace', 'components-content-ai-gap-suggestion-card--dismissed-replace', 480, 120],

  // AI Suggestions rail card
  ['ai-suggestions-pre-review', 'components-content-ai-suggestions-card--pre-review', 480, 280],
  ['ai-suggestions-terminal', 'components-content-ai-suggestions-card--terminal', 480, 280],

  // Article body (read mode for AI gaps)
  ['article-body-all-inactive', 'components-content-article-body--all-inactive', 800, 1200],
  ['article-body-all-accepted', 'components-content-article-body--all-accepted', 800, 1200],

  // Suggestion blocks (inline)
  ['suggestion-block-addition', 'components-content-suggestion-block--addition', 800, 320],
  ['suggestion-block-replace', 'components-content-suggestion-block--replace', 800, 320],
  ['suggestion-block-removal', 'components-content-suggestion-block--removal', 800, 240],

  // Hub suggestion card
  ['suggestion-card-default', 'components-content-suggestion-card--default', 920, 200],
  ['suggestion-card-new-article', 'components-content-suggestion-card--new-article', 920, 200],
  ['suggestion-card-move-article', 'components-content-suggestion-card--move-article', 920, 200],

  // AI sub-nav
  ['ai-sub-nav-default', 'components-navigation-ai-sub-nav--default', 320, 700],

  // Sources side sheet
  ['sources-default', 'components-overlays-sources-side-sheet--default', 1280, 800],

  // KB AI Gaps frames
  ['kbgaps-frame-2', 'patterns-kb-ai-gaps--frame-2-pre-review', 1280, 1100],
  ['kbgaps-frame-3', 'patterns-kb-ai-gaps--frame-3-active-addition', 1280, 1100],
  ['kbgaps-frame-5', 'patterns-kb-ai-gaps--frame-5-accepted-addition', 1280, 1100],
  ['kbgaps-frame-8', 'patterns-kb-ai-gaps--frame-8-active-removal', 1280, 1100],
  ['kbgaps-frame-10', 'patterns-kb-ai-gaps--frame-10-terminal', 1280, 1100],

  // AI Optimise Hub
  ['kb-ai-optimise-hub', 'patterns-kb-ai-optimise-hub--default', 1280, 1000],

  // Phase 5: KB Editor
  ['kb-editor-default', 'patterns-kb-editor-page--default', 1280, 900],

  // Phase 4: KB Category
  ['kb-category', 'patterns-kb-category-page--managing-emails', 1280, 900],
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
