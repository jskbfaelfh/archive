// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file ensure-playwright.mjs
 * @description Prepare Chromium and Playwright with project-contained caches.
 * @created 2026-09-23
 * @modified 2026-10-18
 */
import { existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const env = { ...process.env, PLAYWRIGHT_BROWSERS_PATH: resolve(root, '.work/browsers'),
  npm_config_cache: resolve(root, '.work/npm-cache'), TEMP: resolve(root, '.work/tmp'), TMP: resolve(root, '.work/tmp') };
for (const path of [env.PLAYWRIGHT_BROWSERS_PATH, env.npm_config_cache, env.TEMP]) mkdirSync(path, { recursive: true });
Object.assign(process.env, env);
function run(command, args, shell = false) {
  const result = spawnSync(command, args, { cwd: root, env, stdio: 'inherit', shell });
  if (result.error || result.status !== 0) throw new Error('تعذر تجهيز أدوات الاختبار المحلية.');
}
try {
  if (!existsSync(resolve(root, 'node_modules/@playwright/test/package.json'))) {
    run(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['install', '--save-dev', '@playwright/test'], process.platform === 'win32');
  }
  const { chromium } = await import('playwright');
  if (!existsSync(chromium.executablePath())) run(process.execPath, [resolve(root, 'node_modules/playwright/cli.js'), 'install', 'chromium']);
  console.log('أدوات اختبار المتصفح جاهزة داخل مجلد النظام.');
} catch (error) {
  console.error(error instanceof Error ? error.message : 'تعذر تجهيز الاختبارات.');
  process.exitCode = 1;
}
