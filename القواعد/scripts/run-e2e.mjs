// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file run-e2e.mjs
 * @description Run browser tests using only the local fake backend and contained browser cache.
 * @created 2026-10-18
 * @modified 2026-10-18
 */
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const temp = resolve(root, '.work/tmp');
mkdirSync(temp, { recursive: true });
const env = { ...process.env, PLAYWRIGHT_BROWSERS_PATH: resolve(root, '.work/browsers'),
  TEMP: temp, TMP: temp, npm_config_cache: resolve(root, '.work/npm-cache'),
  NEXT_PUBLIC_SUPABASE_URL: 'http://127.0.0.1:54329', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'local-test-public-key',
  NEXT_TELEMETRY_DISABLED: '1' };
for (const [cli, args] of [ ['scripts/ensure-playwright.mjs', []], ['node_modules/playwright/cli.js', ['test', ...process.argv.slice(2)]] ]) {
  const result = spawnSync(process.execPath, [resolve(root, cli), ...args], { cwd: root, env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) { process.exitCode = result.status ?? 1; break; }
}
