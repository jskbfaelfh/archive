// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file run-db-tests.mjs
 * @description Run SQL migrations/tests in a fresh loopback-only portable PostgreSQL cluster.
 * @created 2026-10-18
 * @modified 2026-10-18
 */
import { existsSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
function find(dir, name) {
  if (!existsSync(dir)) return null;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isFile() && entry.name === name) return path;
    if (entry.isDirectory()) { const found = find(path, name); if (found) return found; }
  }
  return null;
}
const executable = name => find(resolve(root, '.work/tools/node_modules/@embedded-postgres/windows-x64'), `${name}.exe`);
const initdb = executable('initdb'), pgctl = executable('pg_ctl'), psql = executable('psql');
if (!initdb || !pgctl || !psql) throw new Error('جهّز PostgreSQL المحمول داخل .work/tools قبل اختبارات القاعدة.');
const folder = resolve(root, '.work/db', `run-${Date.now()}`), data = resolve(folder, 'data');
mkdirSync(folder, { recursive: true });
const temp = resolve(root, '.work/tmp');
mkdirSync(temp, { recursive: true });
const env = { ...process.env, TEMP: temp, TMP: temp, PGHOST: '127.0.0.1', PGPORT: '55437',
  PGUSER: 'postgres', PGDATABASE: 'postgres', PGPASSWORD: '', PATH: `${dirname(psql)};${process.env.PATH}` };
function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, env, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.error || result.status !== 0) throw new Error(`Local SQL command failed: ${result.error?.message ?? result.status}`);
}
const bootstrap = resolve(folder, 'bootstrap.sql');
writeFileSync(bootstrap, `CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;
CREATE SCHEMA auth;
CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
 SELECT COALESCE(NULLIF(current_setting('request.jwt.claim.sub',true),''),
 NULLIF(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid;
$$;
GRANT USAGE ON SCHEMA auth TO anon,authenticated,service_role;
GRANT EXECUTE ON FUNCTION auth.uid() TO anon,authenticated,service_role;
`, 'utf8');
let started = false;
try {
  run(initdb, ['-D', data, '-U', 'postgres', '--auth=trust', '--encoding=UTF8', '--no-locale']);
  run(pgctl, ['-D', data, '-l', resolve(folder, 'postgres.log'), '-o', '-h 127.0.0.1 -p 55437', '-w', 'start']);
  started = true;
  const sql = path => run(psql, ['-X', '--set=ON_ERROR_STOP=1', '--file', path]);
  sql(bootstrap);
  for (const name of readdirSync(resolve(root, 'supabase/migrations')).filter(name => name.endsWith('.sql')).sort()) {
    console.log(`MIGRATION ${name}`); sql(resolve(root, 'supabase/migrations', name));
  }
  const tests = resolve(root, 'supabase/tests');
  const files = existsSync(tests) ? readdirSync(tests).filter(name => name.endsWith('.sql')).sort() : [];
  if (!files.length) throw new Error('No SQL security tests found.');
  for (const name of files) { console.log(`SQL TEST ${name}`); sql(resolve(tests, name)); }
  console.log('نجحت الترحيلات واختبارات القاعدة المحلية المعزولة.');
} finally {
  if (started) run(pgctl, ['-D', data, '-m', 'fast', '-w', 'stop']);
}
