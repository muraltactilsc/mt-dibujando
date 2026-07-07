#!/usr/bin/env node
// (executor) Screenshot helper for this repo's local web target.
//
// Usage:
//   node .claude/shared/scripts/ui-shot.mjs <path> <module>/<name> [wait-text]
// Example:
//   node .claude/shared/scripts/ui-shot.mjs / home/home "Bienvenido"
//
// Writes to .claude/dev/screenshots/<module>/<name>.png (git-ignored). Uses the cached
// Playwright Chromium. Fails if the wait-text never renders so screenshots are real evidence,
// not hollow loading states.
//
// This is a placeholder for the formal ui-shot.mjs later tasks will refine; it is enough to
// capture the scaffolded Expo web target at http://localhost:8081.

import { chromium } from 'playwright';
import { existsSync, mkdirSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const baseUrl = process.env.UI_SHOT_URL || 'http://localhost:8081';

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

const [pathArg, outArg, waitText] = process.argv.slice(2);
if (!pathArg || !outArg) {
  console.error(
    'Usage: node .claude/shared/scripts/ui-shot.mjs <path> <module>/<name> [wait-text]',
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

const targetUrl = new URL(pathArg, baseUrl).toString();
const browser = await chromium.launch({ executablePath, headless: true });

try {
  const page = await browser.newPage({ viewport });
  const response = await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 60000 });
  if (!response?.ok()) {
    console.error(`FAIL: target page returned HTTP ${response?.status() ?? 'unknown'}.`);
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
        `FAIL: wait-text "${waitText}" never rendered within 30s — refusing to save hollow evidence.`,
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
