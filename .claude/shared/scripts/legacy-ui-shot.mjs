#!/usr/bin/env node
// (executor) Authenticated screenshot helper against the HOSTED dev deployment of the legacy
// Portal Dibujando, for faithful rebuild validation — the companion of ui-shot.mjs (this repo's
// new app), matching the mt-medspace precedent. There is no local legacy instance for this
// project; the legacy source has no local run instructions, so this always targets the hosted
// DEV site over the network.
//
// Usage:
//   node .claude/shared/scripts/legacy-ui-shot.mjs <path> <module>/<name> [wait-text] [--public]
// Example:
//   node .claude/shared/scripts/legacy-ui-shot.mjs / legacy/home "Bienvenido"
//   node .claude/shared/scripts/legacy-ui-shot.mjs /OSC/RegisterOSC legacy/osc-profile "Base Institucional"
//   node .claude/shared/scripts/legacy-ui-shot.mjs /Account/Login legacy/login "Iniciar Sesión" --public
//
// Pass --public for an [AllowAnonymous] page (Login/Register/ForgotPassword/...) — skips the
// login step entirely instead of logging in and then re-navigating to the same anonymous page
// (which can bounce off an already-authenticated redirect). LEGACY_APP_EMAIL/PASSWORD are not
// required in this mode.
//
// Writes to .claude/dev/screenshots/<module>/<name>.png (git-ignored). Uses the cached
// Playwright Chromium (see ui-shot.mjs), and fails instead of saving when the requested wait
// text never renders. Requires LEGACY_APP_URL always, and (unless --public) LEGACY_APP_EMAIL /
// LEGACY_APP_PASSWORD too (see CLAUDE.local.md) — real legacy portal test credentials for the
// hosted DEV environment, not production; git-ignored per project convention, never commit them.
//
// This site is READ-ONLY reference truth — never submit a form that writes data (create/edit/
// delete/upload) through this script; it exists only to compare the rebuild's screens against
// the legacy original.

import { chromium } from 'playwright';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const baseUrl = process.env.LEGACY_APP_URL;

function resolveChrome() {
  if (process.env.CHROME_BIN && existsSync(process.env.CHROME_BIN)) return process.env.CHROME_BIN;
  const cache = process.env.PLAYWRIGHT_BROWSERS_PATH || join(homedir(), '.cache', 'ms-playwright');
  if (!existsSync(cache)) return null;
  const candidates = readdirSync(cache)
    .filter((d) => d.startsWith('chromium-') || d.startsWith('chromium_headless_shell-'))
    .sort()
    .reverse()
    .flatMap((d) => [
      join(cache, d, 'chrome-linux', 'chrome'),
      join(cache, d, 'chrome-linux', 'headless_shell'),
      join(cache, d, 'chrome-linux64', 'chrome'),
      join(cache, d, 'chrome-linux64', 'headless_shell'),
    ]);
  return candidates.find(existsSync) ?? null;
}

const rawArgs = process.argv.slice(2);
const isPublic = rawArgs.includes('--public');
const [pathArg, outArg, waitText] = rawArgs.filter((a) => a !== '--public');
if (!pathArg || !outArg) {
  console.error(
    'Usage: node .claude/shared/scripts/legacy-ui-shot.mjs <path> <module>/<name> [wait-text] [--public]',
  );
  process.exit(2);
}

const email = process.env.LEGACY_APP_EMAIL;
const password = process.env.LEGACY_APP_PASSWORD;
if (!baseUrl || (!isPublic && (!email || !password))) {
  console.error(
    'FAIL: missing LEGACY_APP_URL' +
      (isPublic ? '' : ' / LEGACY_APP_EMAIL / LEGACY_APP_PASSWORD') +
      ' in environment (see CLAUDE.local.md).',
  );
  process.exit(2);
}

const executablePath = resolveChrome();
if (!executablePath) {
  console.error(
    'No cached Chromium found. Set CHROME_BIN, or run `npx playwright install chromium`.',
  );
  process.exit(3);
}

const outPath = join(repoRoot, '.claude', 'dev', 'screenshots', `${outArg}.png`);
mkdirSync(dirname(outPath), { recursive: true });
const viewport = {
  width: Number(process.env.UI_SHOT_WIDTH ?? 1440),
  height: Number(process.env.UI_SHOT_HEIGHT ?? 900),
};

const loginUrl = new URL('/Account/Login', baseUrl).toString();
const targetUrl = new URL(pathArg, baseUrl).toString();
const browser = await chromium.launch({ executablePath, headless: true });

try {
  const page = await browser.newPage({ viewport });

  if (!isPublic) {
    const loginResponse = await page.goto(loginUrl, { waitUntil: 'networkidle', timeout: 60000 });
    if (!loginResponse?.ok()) {
      console.error(
        `FAIL: legacy login page returned HTTP ${loginResponse?.status() ?? 'unknown'}.`,
      );
      process.exit(5);
    }

    // Real ASP.NET Identity form login (confirmed field ids against the live page): #Email/#Password.
    await page.locator('#Email').fill(email);
    await page.locator('#Password').fill(password);
    await Promise.all([
      page.waitForURL((url) => url.pathname !== '/Account/Login', { timeout: 30000 }),
      page.locator('button[type="submit"]').click(),
    ]).catch(() => {
      console.error(
        'FAIL: login did not navigate away from /Account/Login; check the legacy test credentials ' +
          'or whether the login form changed.',
      );
      process.exit(5);
    });
    await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => undefined);

    // Legacy issues the stock OWIN cookie-auth cookie (never renamed — see the auth research in
    // rebuild-task-breakdown.md's Task 2).
    const cookies = await page.context().cookies(baseUrl);
    if (!cookies.some((cookie) => cookie.name === '.AspNet.ApplicationCookie')) {
      console.error(
        'FAIL: login did not produce the .AspNet.ApplicationCookie cookie; check the legacy test ' +
          'credentials.',
      );
      process.exit(5);
    }
  }

  const targetResponse = await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 60000 });
  if (!targetResponse?.ok()) {
    console.error(`FAIL: target page returned HTTP ${targetResponse?.status() ?? 'unknown'}.`);
    process.exit(6);
  }
  if (!isPublic && new URL(page.url()).pathname === '/Account/Login') {
    console.error('FAIL: target page redirected to login; authenticated session was not accepted.');
    process.exit(5);
  }

  if (waitText) {
    try {
      await page.waitForFunction(
        (text) => !!document.body && document.body.innerText.includes(text),
        waitText,
        { timeout: 30000 },
      );
    } catch {
      console.error(
        `FAIL: wait-text "${waitText}" never rendered within 30s — refusing to save hollow evidence.\n` +
          'Confirm the authenticated route shows the expected text.',
      );
      process.exit(4);
    }
  }

  await page.waitForTimeout(waitText ? 500 : 3000);
  await page.screenshot({ path: outPath, fullPage: true });
  console.log(`screenshot saved: ${outPath}${waitText ? ` (verified "${waitText}" visible)` : ''}`);
} finally {
  await browser.close();
}
