// Phase 7.5.5 verification — Journey A steps 7-11 + 13-16.
//
// Walks the demo app via Playwright, captures 4 screenshots, and
// asserts each step lands the expected UI / store mutation. All
// console output prefixed with `[verify]` for grep-ability.
//
// Run from repo root:
//   node apps/demo/scripts/phase-7-5-5-verify.mjs

import { chromium } from 'playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, '..');

const BASE = 'http://localhost:5173';

const log = (msg) => console.log(`[verify] ${msg}`);
const fail = (msg) => {
  console.error(`[verify] FAIL: ${msg}`);
  process.exitCode = 1;
};

async function waitForRoute(page, predicate, timeoutMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (predicate(new URL(page.url()))) return true;
    await page.waitForTimeout(50);
  }
  return false;
}

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // Capture browser console — we use console.log as our toast
  // surrogate, so the verification asserts on these strings.
  const consoleEvents = [];
  page.on('console', (msg) => {
    consoleEvents.push(msg.text());
  });

  // ── Step 0: Boot, navigate to a populated category ────────
  log('Booting app…');
  await page.goto(`${BASE}/kb/managing-emails/shared-inboxes/creating-shared-inboxes`);
  await page.waitForSelector('[data-route="kb-category"]', { timeout: 5000 });
  log('Category page loaded.');

  // ── Step 7: Click "How to reset your password" article ────
  log('Clicking "How to reset your password" article…');
  // Article rows are inside ArticlesTable — locate by visible text.
  const articleRow = page.getByText('How to reset your password', { exact: false }).first();
  await articleRow.click();

  await waitForRoute(page, (u) => u.pathname.startsWith('/articles/') && u.pathname.endsWith('/edit'));
  await page.waitForSelector('[data-route="kb-editor"]', { timeout: 5000 });
  await page.waitForSelector('.ProseMirror', { timeout: 5000 });
  await page.waitForSelector('[data-kb-part="article-settings-panel"]', { timeout: 5000 });
  log('Editor opened. Tiptap body present + settings panel present.');

  // Confirm body has actual content (not empty placeholder).
  const bodyTextLen = await page.locator('.ProseMirror').evaluate(
    (el) => (el.textContent ?? '').length,
  );
  if (bodyTextLen < 50) {
    fail(`Editor body text too short (${bodyTextLen} chars). Expected substantive HTML.`);
  } else {
    log(`Editor body has ${bodyTextLen} chars of text.`);
  }

  // Screenshot 1 — editor loaded (scroll <main> + window to top so the
  // breadcrumb is visible at the top of the screenshot)
  await page.evaluate(() => {
    const main = document.querySelector('main');
    if (main) main.scrollTop = 0;
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(100);
  // Take a fullPage shot to capture the entire editor + settings panel
  // regardless of intrinsic body height vs viewport.
  await page.screenshot({
    path: path.join(APP_ROOT, '.phase-7-5-5-editor-loaded.png'),
    fullPage: true,
  });
  log('Captured: .phase-7-5-5-editor-loaded.png');

  // ── Step 8: Type in editor → "Save as draft" enables ──────
  log('Typing in editor body…');
  await page.locator('.ProseMirror').click();
  // Move caret to end then type.
  await page.keyboard.press('End');
  await page.keyboard.type(' [verified by Playwright]');
  await page.waitForTimeout(100);

  // Save button is in the breadcrumb. Locate by visible text.
  const saveBtn = page.getByRole('button', { name: 'Save as draft' });
  const saveDisabledAfterType = await saveBtn.isDisabled();
  if (saveDisabledAfterType) {
    fail('Save as draft is disabled after typing — should be enabled (dirty).');
  } else {
    log('Save as draft is enabled after typing.');
  }
  // Also verify the editor data-dirty attribute flipped.
  const dirty = await page.locator('[data-route="kb-editor"]').getAttribute('data-dirty');
  log(`data-dirty=${dirty}`);

  // Screenshot 2 — editor dirty (scroll to top so breadcrumb is visible)
  await page.evaluate(() => {
    // AppShell's <main> is the scroll container (overflow-y-auto), not the
    // window. Scroll both for safety.
    const main = document.querySelector('main');
    if (main) main.scrollTop = 0;
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(100);
  await page.screenshot({
    path: path.join(APP_ROOT, '.phase-7-5-5-editor-dirty.png'),
    fullPage: true,
  });
  log('Captured: .phase-7-5-5-editor-dirty.png');

  // ── Step 10: Cmd+S → save fires, button disables ──────────
  log('Pressing Cmd/Ctrl+S to save…');
  // Modifier — page.keyboard handles Meta on macOS bindings.
  consoleEvents.length = 0;
  await page.keyboard.press('Meta+s');
  await page.waitForTimeout(150);
  const sawSaveToast = consoleEvents.some((e) => e.includes('[toast] Draft saved.'));
  if (!sawSaveToast) {
    // Fall back to Control+s for non-mac contexts.
    await page.keyboard.press('Control+s');
    await page.waitForTimeout(150);
  }
  const sawSaveToastFinal = consoleEvents.some((e) => e.includes('[toast] Draft saved.'));
  if (!sawSaveToastFinal) {
    fail(`No "Draft saved." toast in console. Saw: ${JSON.stringify(consoleEvents)}`);
  } else {
    log('Cmd+S fired Save toast.');
  }
  // After save, button should disable.
  await page.waitForTimeout(100);
  const saveDisabledAfterSave = await saveBtn.isDisabled();
  if (!saveDisabledAfterSave) {
    fail('Save as draft is still enabled after save — should disable (clean).');
  } else {
    log('Save as draft re-disabled after Save.');
  }

  // ── Step 11: Click Publish → toast + navigate to category page
  log('Clicking Publish…');
  consoleEvents.length = 0;
  const publishBtn = page.getByRole('button', { name: /Publish/ });
  await publishBtn.click();
  await waitForRoute(page, (u) => u.pathname.startsWith('/kb/'));
  await page.waitForSelector('[data-route="kb-category"]', { timeout: 5000 });
  const sawPublishToast = consoleEvents.some((e) =>
    e.includes('[toast] Article published.'),
  );
  if (!sawPublishToast) {
    fail(`No "Article published." toast. Saw: ${JSON.stringify(consoleEvents)}`);
  } else {
    log('Publish toast fired and navigated back to category page.');
  }

  // Confirm article badge now shows "Published" on category page.
  // ArticlesTable rows render the status badge as text "Published" / "Draft".
  const publishedRow = page
    .locator('tr', { hasText: 'How to reset your password' })
    .first();
  const rowText = await publishedRow.textContent();
  if (!rowText || !/Published/i.test(rowText)) {
    fail(`Article row text does not show Published. Got: "${rowText}"`);
  } else {
    log('Article badge on category page now shows Published.');
  }

  // Screenshot 4 — after publish
  await page.screenshot({
    path: path.join(APP_ROOT, '.phase-7-5-5-after-publish.png'),
    fullPage: false,
  });
  log('Captured: .phase-7-5-5-after-publish.png');

  // ── Step 13: Setting up Hiver → "+ New" → empty draft editor
  log('Navigating to Setting up Hiver…');
  await page.goto(`${BASE}/kb/getting-started/setting-up-hiver`);
  await page.waitForSelector('[data-route="kb-category"]', { timeout: 5000 });
  log('Clicking + New article CTA…');
  const newBtn = page.getByRole('button', { name: /New article/i });
  await newBtn.click();
  await waitForRoute(page, (u) => u.pathname.startsWith('/articles/untitled-'));
  await page.waitForSelector('[data-route="kb-editor"]', { timeout: 5000 });
  await page.waitForSelector('.ProseMirror', { timeout: 5000 });
  const newBodyTextLen = await page.locator('.ProseMirror').evaluate(
    (el) => (el.textContent ?? '').replace(/\s/g, '').length,
  );
  if (newBodyTextLen !== 0) {
    fail(`New draft body has text content (${newBodyTextLen} chars). Should be empty.`);
  } else {
    log('New draft editor is empty.');
  }

  // Screenshot 3 — empty new draft
  await page.screenshot({
    path: path.join(APP_ROOT, '.phase-7-5-5-editor-new-draft.png'),
    fullPage: false,
  });
  log('Captured: .phase-7-5-5-editor-new-draft.png');

  // ── Step 15a: Close × on empty new draft → silent discard ──
  log('Clicking × close on empty new draft (no confirm should appear)…');
  consoleEvents.length = 0;
  // Listen for any unexpected dialog (window.confirm).
  let unexpectedDialog = false;
  page.once('dialog', (d) => {
    unexpectedDialog = true;
    d.dismiss();
  });
  const closeBtn = page.getByRole('button', { name: 'Close' });
  await closeBtn.click();
  await page.waitForTimeout(200);
  await waitForRoute(page, (u) => u.pathname.startsWith('/kb/'));
  if (unexpectedDialog) {
    fail('Confirm dialog appeared on empty new draft close — should silently discard.');
  } else {
    log('Empty new draft silently discarded, navigated back.');
  }
  const sawDiscardToast = consoleEvents.some((e) => e.includes('[toast] Draft discarded.'));
  if (!sawDiscardToast) {
    fail(`No "Draft discarded." toast. Saw: ${JSON.stringify(consoleEvents)}`);
  } else {
    log('Discard toast fired.');
  }

  // ── Step 15b: Existing article, type, × close → confirm appears, cancel keeps
  log('Opening another article and verifying close-with-dirty confirm path…');
  // Use a category that we know has articles. Reuse the original
  // category page — it has the now-published article + others.
  await page.goto(`${BASE}/kb/managing-emails/shared-inboxes/creating-shared-inboxes`);
  await page.waitForSelector('[data-route="kb-category"]', { timeout: 5000 });
  const otherArticleRow = page.locator('tr', { hasText: 'How to reset your password' }).first();
  await otherArticleRow.click();
  await waitForRoute(page, (u) => u.pathname.startsWith('/articles/'));
  await page.waitForSelector('.ProseMirror', { timeout: 5000 });
  await page.locator('.ProseMirror').click();
  await page.keyboard.press('End');
  await page.keyboard.type(' [more]');
  await page.waitForTimeout(100);

  // Click × first time, dismiss confirm → should stay on editor.
  log('Clicking × close → expecting confirm; choosing CANCEL…');
  let dialogCount = 0;
  let nextChoice = 'dismiss'; // 'dismiss' | 'accept'
  const dialogHandler = async (d) => {
    dialogCount += 1;
    log(`  dialog #${dialogCount}: type=${d.type()} message="${d.message()}"`);
    try {
      if (nextChoice === 'accept') await d.accept();
      else await d.dismiss();
    } catch (e) {
      log(`  dialog handler error: ${e.message}`);
    }
  };
  page.on('dialog', dialogHandler);

  await page.getByRole('button', { name: 'Close' }).click();
  await page.waitForTimeout(300);
  if (dialogCount === 0) {
    fail('No confirm dialog appeared on dirty close.');
  } else if (dialogCount > 1) {
    fail(`Multiple confirm dialogs appeared (${dialogCount}) — should be exactly 1.`);
  } else {
    log('Single confirm dialog appeared on dirty close.');
  }
  const stillOnEditor = page.url().includes('/edit');
  if (!stillOnEditor) {
    fail(`Cancelled confirm but navigated away. URL: ${page.url()}`);
  } else {
    log('Cancelled confirm — stayed on editor as expected.');
  }

  // Click × again, accept confirm → navigates back without saving.
  log('Clicking × close again → expecting confirm; choosing OK…');
  dialogCount = 0;
  nextChoice = 'accept';
  await page.getByRole('button', { name: 'Close' }).click();
  await waitForRoute(page, (u) => u.pathname.startsWith('/kb/'), 5000);
  await page.waitForTimeout(200);
  if (dialogCount === 0) {
    fail('Second × click did not produce a confirm dialog.');
  } else if (dialogCount > 1) {
    fail(`Multiple confirm dialogs (${dialogCount}) on accept-path close.`);
  } else {
    log('Single confirm dialog appeared, accepted, navigated back.');
  }
  page.off('dialog', dialogHandler);

  await browser.close();

  if (process.exitCode === 1) {
    log('VERIFICATION FAILED — see [verify] FAIL lines above.');
  } else {
    log('VERIFICATION PASSED.');
  }
}

run().catch((err) => {
  console.error('[verify] crashed:', err);
  process.exit(2);
});
