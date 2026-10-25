// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file deep_scan_translations.mjs
 * @description Check actual dictionary key/value parity and literal translation references.
 * @created 2026-09-23
 * @modified 2026-10-18
 */
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
function flatten(value, prefix = '', target = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('القاموس يجب أن يكون كائنًا.');
  for (const [key, item] of Object.entries(value)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof item === 'string' && item.trim()) target[path] = item;
    else if (item && typeof item === 'object' && !Array.isArray(item)) flatten(item, path, target);
    else errors.push(`قيمة ترجمة فارغة أو غير صالحة: ${path}`);
  }
  return target;
}
function dictionaries(language) {
  const dir = resolve(root, 'src/i18n', language);
  if (!existsSync(dir)) throw new Error(`قاموس ${language} غير موجود؛ لا يمكن تخطي الفحص.`);
  const files = readdirSync(dir).filter(name => name.endsWith('.json')).sort();
  if (!files.length) throw new Error(`قاموس ${language} فارغ.`);
  return Object.fromEntries(files.map(name => [name, flatten(JSON.parse(readFileSync(resolve(dir, name), 'utf8')))]));
}
function scan(dir, keys) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) { scan(path, keys); continue; }
    if (!/\.tsx?$/.test(entry.name)) continue;
    const source = ts.createSourceFile(path, readFileSync(path, 'utf8'), ts.ScriptTarget.Latest, true);
    function visit(node) {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === 't') {
        const first = node.arguments[0];
        if (first && ts.isStringLiteralLike(first) && !keys.has(first.text)) errors.push(`مفتاح مفقود ${first.text}: ${relative(root, path)}`);
      }
      ts.forEachChild(node, visit);
    }
    visit(source);
  }
}
try {
  const ar = dictionaries('ar'), en = dictionaries('en');
  const allKeys = new Set();
  for (const name of new Set([...Object.keys(ar), ...Object.keys(en)])) {
    if (!ar[name] || !en[name]) { errors.push(`ملف قاموس غير متطابق: ${name}`); continue; }
    for (const key of new Set([...Object.keys(ar[name]), ...Object.keys(en[name])])) {
      if (!(key in ar[name]) || !(key in en[name])) errors.push(`مفتاح غير متطابق ${name}:${key}`);
      allKeys.add(key);
    }
  }
  scan(resolve(root, 'src'), allKeys);
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(`نجح فحص القيم وتطابق ${allKeys.size} مفتاح ترجمة ومراجع t النصية. النسخ الثنائية المباشرة تفحص باختبارات الواجهة.`);
} catch (error) { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; }
