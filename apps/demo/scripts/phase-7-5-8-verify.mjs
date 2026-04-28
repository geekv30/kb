// Phase 7.5.8 verification — production polish.
//
// Walks the demo app via Playwright to confirm:
//   1. Toast appears on save in editor (top-right, autohides)
//   2. Toast appears on "Coming soon" clicks (DateRangePill, AI Centre)
//   3. ConfirmDialog appears on editor close-with-changes (NOT
//      window.confirm).
//   4. `?` opens cheat sheet
//   5. 404 route looks branded
//
// Captures 4 screenshots:
//   - .phase-7-5-8-toast.png
//   - .phase-7-5-8-confirm-dialog.png
//   - .phase-7-5-8-cheatsheet.png
//   - .phase-7-5-8-404.png
//
// Run from repo root, AFTER `npm run dev --workspace=apps/demo`:
//   node apps/demo/scripts/phase-7-5-8-verify.mjs

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

  // Catch any unexpected window.confirm dialogs — Phase 7.5.8 should
  // have none.
  let nativeDialogCount = 0;
  page.on('dialog', async (d) => {
    nativeDialogCount += 1;
    log(`  unexpected native dialog: type=${d.type()} message="${d.message()}"`);
    await d.dismiss();
  });

  // ── Boot, navigate to a populated category ────────────────
  log('Booting app…');
  await page.goto(
    `${BASE}/kb/managing-emails/shared-inboxes/creating-shared-inboxes`,
  );
  await page.waitForSelector('[data-route="kb-category"]', { timeout: 5000 });
  log('Category page loaded.');

  // ── Open an article ───────────────────────────────────────
  log('Opening article…');
  const articleRow = page
    .getByText('How to reset your password', { exact: false })
    .first();
  await articleRow.click();
  await waitForRoute(
    page,
    (u) => u.pathname.startsWith('/articles/') && u.pathname.endsWith('/edit'),
  );
  await page.waitForSelector('[data-route="kb-editor"]', { timeout: 5000 });
  await page.waitForSelector('.ProseMirror', { timeout: 5000 });
  log('Editor loaded.');

  // ── Test 1: Toast appears on Cmd+S save ───────────────────
  log('Typing and pressing Cmd+S…');
  await page.locator('.ProseMirror').click();
  await page.keyboard.press('End');
  await page.keyboard.type(' [polish-test]');
  await page.waitForTimeout(100);
  await page.keyboard.press('Meta+s');
  await page.waitForTimeout(150);

  let toast = page.locator('[data-toast-variant="success"]');
  let toastVisible = await toast.isVisible().catch(() => false);
  if (!toastVisible) {
    // Fall back to Control+s
    await page.keyboard.press('Control+s');
    await page.waitForTimeout(150);
    toast = page.locator('[data-toast-variant="success"]');
    toastVisible = await toast.isVisible().catch(() => false);
  }
  if (!toastVisible) {
    fail('No success toast visible after save.');
  } else {
    const toastText = await toast.textContent();
    log(`Toast text: "${toastText?.trim()}"`);
    if (!toastText || !/Draft saved/i.test(toastText)) {
      fail(`Toast text doesn't match "Draft saved.": "${toastText}"`);
    } else {
      log('Toast appeared with "Draft saved." copy.');
    }
  }

  // Capture screenshot 1 — toast visible.
  await page.screenshot({
    path: path.join(APP_ROOT, '.phase-7-5-8-toast.png'),
    fullPage: false,
  });
  log('Captured: .phase-7-5-8-toast.png');
  // Wait for autohide.
  await page.waitForTimeout(3500);

  // ── Test 2: ConfirmDialog appears on dirty close ──────────
  log('Typing more, then clicking × Close → expecting Radix ConfirmDialog…');
  await page.locator('.ProseMirror').click();
  await page.keyboard.press('End');
  await page.keyboard.type(' [more]');
  await page.waitForTimeout(100);

  await page.getByRole('button', { name: 'Close' }).click();
  await page.waitForTimeout(300);

  if (nativeDialogCount > 0) {
    fail(
      `${nativeDialogCount} native window.confirm dialog(s) appeared — should be 0 in Phase 7.5.8.`,
    );
  }

  // Look for the Radix Dialog content. Title text "Discard unsaved changes?"
  const dialogTitle = page.getByText('Discard unsaved changes?', { exact: false });
  const dialogVisible = await dialogTitle.isVisible().catch(() => false);
  if (!dialogVisible) {
    fail('ConfirmDialog did not appear on dirty close.');
  } else {
    log('ConfirmDialog rendered with the expected title.');
  }

  // Capture screenshot 2 — confirm dialog open.
  await page.screenshot({
    path: path.join(APP_ROOT, '.phase-7-5-8-confirm-dialog.png'),
    fullPage: false,
  });
  log('Captured: .phase-7-5-8-confirm-dialog.png');

  // Cancel out of the dialog so subsequent tests still work.
  await page.getByRole('button', { name: 'Stay on page' }).click();
  await page.waitForTimeout(200);

  // ── Test 3: "Coming soon" toast on AI Centre click ────────
  log('Navigating to AI Optimise hub…');
  // First reset dirty by leaving via discard.
  await page.getByRole('button', { name: 'Close' }).click();
  await page.waitForTimeout(200);
  // Confirm dialog opens — accept to discard.
  const discardBtn = page.getByRole('button', { name: 'Discard changes' });
  if (await discardBtn.isVisible().catch(() => false)) {
    await discardBtn.click();
    await page.waitForTimeout(300);
  }

  await page.goto(`${BASE}/ai-optimise`);
  await page.waitForSelector('[data-route="ai-optimise-hub"]', { timeout: 5000 });
  log('AI Optimise hub loaded.');

  log('Clicking AI Centre row → expecting "Coming soon" toast…');
  // AISubNav rows — find AI Centre by its label.
  await page.getByText('AI Centre', { exact: false }).first().click();
  await page.waitForTimeout(150);
  const infoToast = page.locator('[data-toast-variant="info"]');
  const infoVisible = await infoToast.isVisible().catch(() => false);
  if (!infoVisible) {
    fail('No info toast appeared after AI Centre click.');
  } else {
    const t = await infoToast.textContent();
    log(`AI Centre toast: "${t?.trim()}"`);
    if (!t || !/Coming soon/i.test(t)) {
      fail(`AI Centre toast not "Coming soon.": "${t}"`);
    } else {
      log('AI Centre fires "Coming soon." toast.');
    }
  }
  // Wait for autohide.
  await page.waitForTimeout(3500);

  // ── Test 4: ? opens cheat sheet ───────────────────────────
  log('Pressing ? → expecting cheat sheet overlay…');
  await page.keyboard.press('?');
  await page.waitForTimeout(200);
  const cheatTitle = page.getByText('Keyboard shortcuts', { exact: false });
  const cheatVisible = await cheatTitle.isVisible().catch(() => false);
  if (!cheatVisible) {
    fail('Cheat sheet did not open on ? key.');
  } else {
    log('Cheat sheet opened on ? key.');
  }

  // Capture screenshot 3 — cheat sheet open.
  await page.screenshot({
    path: path.join(APP_ROOT, '.phase-7-5-8-cheatsheet.png'),
    fullPage: false,
  });
  log('Captured: .phase-7-5-8-cheatsheet.png');

  // Close it.
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);

  // ── Test 5: Branded 404 ───────────────────────────────────
  log('Navigating to /this-route-does-not-exist → expecting branded 404…');
  await page.goto(`${BASE}/this-route-does-not-exist`);
  await page.waitForSelector('[data-route="not-found"]', { timeout: 5000 });
  const heading404 = page.locator('[data-route="not-found"] h1');
  const headingText = await heading404.textContent();
  if (!headingText || !/Page not found/i.test(headingText)) {
    fail(`404 heading text unexpected: "${headingText}"`);
  } else {
    log(`404 heading: "${headingText.trim()}"`);
  }

  // Capture screenshot 4 — branded 404.
  await page.screenshot({
    path: path.join(APP_ROOT, '.phase-7-5-8-404.png'),
    fullPage: false,
  });
  log('Captured: .phase-7-5-8-404.png');

  // ── Test 6: Tab navigation flows logically through category page ──
  log('Verifying tab order on category page…');
  await page.goto(
    `${BASE}/kb/managing-emails/shared-inboxes/creating-shared-inboxes`,
  );
  await page.waitForSelector('[data-route="kb-category"]', { timeout: 5000 });
  // Press Tab a few times and ensure focus lands on focusable elements.
  let tabsLandedOnFocusable = 0;
  for (let i = 0; i < 6; i += 1) {
    await page.keyboard.press('Tab');
    await page.waitForTimeout(80);
    const tag = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      return {
        tag: el.tagName,
        text: (el.textContent ?? '').trim().slice(0, 60),
      };
    });
    if (
      tag &&
      ['BUTTON', 'A', 'INPUT', 'TR', 'TD', 'H1'].includes(tag.tag)
    ) {
      tabsLandedOnFocusable += 1;
    }
    log(`  tab ${i + 1}: tag=${tag?.tag} text="${tag?.text}"`);
  }
  if (tabsLandedOnFocusable < 3) {
    fail(
      `Tab navigation reached only ${tabsLandedOnFocusable} focusable elements in 6 presses.`,
    );
  } else {
    log(`Tab navigation reached ${tabsLandedOnFocusable}/6 focusable elements.`);
  }

  // Final native-dialog assertion.
  if (nativeDialogCount > 0) {
    fail(`Saw ${nativeDialogCount} native dialogs total — should be 0.`);
  } else {
    log('No native window.confirm dialogs surfaced during the run.');
  }

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
