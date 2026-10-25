// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file run-unit-tests.mjs
 * @description Discover executable TypeScript unit tests without shell glob expansion.
 * @created 2026-10-18
 * @modified 2026-10-18
 */
import { readdirSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
function discover(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = resolve(dir, entry.name);
    return entry.isDirectory() ? discover(path) : /\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });
}
const files = discover(resolve(root, 'tests')).sort();
if (files.length === 0) throw new Error('لم يتم العثور على اختبارات وحدات.');
const temp = resolve(root, '.work/tmp');
mkdirSync(temp, { recursive: true });
const result = spawnSync(process.execPath, ['--import', 'tsx', '--test', ...files], {
  cwd: root, stdio: 'inherit', env: { ...process.env, TEMP: temp, TMP: temp },
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
