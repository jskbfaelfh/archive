// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file run-edge-tests.mjs
 * @description Typecheck and test self-hosted Edge workers with a contained portable Deno cache.
 * @created 2026-10-18
 * @modified 2026-10-18
 */
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdirSync, existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const executable = process.env.LOCAL_DENO_PATH || resolve(root, '.work/tools/node_modules/@deno/win32-x64/deno.exe');
if (!resolve(executable).startsWith(root + '/'.replace('/', process.platform === 'win32' ? '\\' : '/')) || !existsSync(executable)) {
  throw new Error('يجب تجهيز Deno المحمول داخل مجلد النظام.');
}
const temp = resolve(root, '.work/tmp'), cache = resolve(root, '.work/deno-cache');
for (const dir of [temp, cache]) mkdirSync(dir, { recursive: true });
const env = { ...process.env, TEMP: temp, TMP: temp, DENO_DIR: cache,
  DENO_NO_UPDATE_CHECK: '1', DENO_NO_PACKAGE_JSON: '1' };
const functions = resolve(root, 'supabase/functions/core_university');
const workers = readdirSync(functions, { withFileTypes: true }).filter(entry => entry.isDirectory() && !entry.name.startsWith('_'))
  .map(entry => resolve(functions, entry.name, 'index.ts')).filter(existsSync);
const config = resolve(root, 'scripts/deno-test-config.json');
for (const args of [ ['check', '--config', config, ...workers],
  ['test', '--config', config, '--allow-env', '--allow-read=' + functions, functions] ]) {
  const result = spawnSync(executable, args, { cwd: root, env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) { process.exitCode = result.status ?? 1; break; }
}
