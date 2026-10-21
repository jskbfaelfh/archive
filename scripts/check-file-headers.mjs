// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file check-file-headers.mjs
 * @description Fast automated verification script enforcing Rule 1 & Rule 2:
 * 1. Line 1 mandatory Arabic warning comment.
 * 2. Auto-fix mode (--fix) to automatically prepend the mandatory header if missing.
 * @created 2026-09-23
 * @modified 2026-09-23
 */

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

const MANDATORY_FIRST_LINE = '// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف';
const AUTO_FIX = process.argv.includes('--fix');

const TARGET_EXTENSIONS = new Set(['.ts', '.tsx', '.css', '.dart', '.js', '.jsx', '.mjs', '.cjs']);

const IGNORED_DIRECTORIES = new Set([
  'node_modules',
  'dist',
  'build',
  '.git',
  '.agent-skills',
  '.vscode',
  'scripts'
]);

let totalChecked = 0;
let fixedCount = 0;
const missingHeaderFiles = [];

function scanForHeaders(dir) {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        if (IGNORED_DIRECTORIES.has(entry.name) || entry.name.startsWith('.')) {
          continue;
        }
        scanForHeaders(fullPath);
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase();
        if (TARGET_EXTENSIONS.has(ext)) {
          totalChecked++;
          const content = readFileSync(fullPath, 'utf-8');
          const lines = content.split(/\r\n|\r|\n/);
          const firstLine = (lines[0] || '').trim();
          const relativePath = fullPath.replace(PROJECT_ROOT, '').replace(/^[\\/]/, '');

          // Check for mandatory Arabic first line
          const isCss = ext === '.css' || ext === '.scss';
          const expectedComment = 'يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف';

          if (!firstLine.includes(expectedComment)) {
            if (AUTO_FIX) {
              const line1 = isCss ? `/* ${expectedComment} */` : `// ${expectedComment}`;
              const headerBlock = `${line1}\n/**\n * @file ${basename(entry.name)}\n * @description Auto-generated standard architectural file header.\n * @created 2026-09-23\n * @modified 2026-09-23\n */\n\n`;
              writeFileSync(fullPath, headerBlock + content, 'utf-8');
              fixedCount++;
            } else {
              missingHeaderFiles.push({
                path: relativePath,
                reason: 'Missing exact mandatory first-line warning comment.'
              });
            }
          }
        }
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`Error scanning ${dir}:`, err.message);
    }
  }
}

const SRC_DIR = join(PROJECT_ROOT, 'src');
if (existsSync(SRC_DIR)) {
  for (const directory of ['src', 'supabase/functions', 'tests', 'e2e', 'scripts']) {
    const target = join(PROJECT_ROOT, directory);
    if (existsSync(target)) scanForHeaders(target);
  }
} else {
  scanForHeaders(PROJECT_ROOT);
}

if (AUTO_FIX) {
  console.log(`\n🛠️  File Header Auto-Fix: Processed ${totalChecked} files. Automatically fixed: ${fixedCount} file(s)!\n`);
  process.exit(0);
}

console.log(`\n🛡️  File Header Compliance Audit: Checked ${totalChecked} code files.`);

if (missingHeaderFiles.length > 0) {
  console.error(`\n❌ HEADER VIOLATIONS FOUND: ${missingHeaderFiles.length} file(s) lack required header format:\n`);
  for (const item of missingHeaderFiles) {
    console.error(`   - ${item.path}`);
  }
  console.error(`\nRun 'npm run fix:headers' or 'node scripts/check-file-headers.mjs --fix' to auto-resolve.\n`);
  process.exit(1);
} else {
  console.log(`✅ All files strictly comply with mandatory Line 1 Header standards!\n`);
  process.exit(0);
}

