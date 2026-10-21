// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file check-line-limits.mjs
 * @description Universal multi-language line-count validation script enforcing strict 300-line ceiling per file.
 * Supports: TypeScript, JavaScript, Dart/Flutter, Python, PHP, C, C++, C#, Go, Rust, Java, Kotlin, Swift, Ruby, etc.
 * @created 2026-09-23
 * @modified 2026-09-23
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

const MAX_LINES = 300;
const WARNING_THRESHOLD = 230;

// Universal set of programming language extensions to audit
const CODE_EXTENSIONS = new Set([
  // Web & TypeScript / JavaScript
  '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.vue', '.svelte', '.css', '.scss', '.sass', '.less',
  // Flutter & Dart
  '.dart',
  // Python
  '.py', '.pyw',
  // PHP
  '.php', '.phtml',
  // C / C++ / C#
  '.c', '.h', '.cpp', '.hpp', '.cc', '.cxx', '.cs',
  // Java & Kotlin & Swift & Go & Rust & Ruby
  '.java', '.kt', '.kts', '.swift', '.go', '.rs', '.rb',
  // Shell & Scripts
  '.sh', '.bash', '.ps1',
  // Database / Query
  '.sql'
]);

// Ignored folders across different ecosystems (Node, Python, Flutter, PHP, C/C++, etc.)
const IGNORED_DIRECTORIES = new Set([
  'node_modules',
  'dist',
  'build',
  '.next',
  '.nuxt',
  'out',
  '.git',
  '.agent-skills',
  '.vscode',
  '.idea',
  // Flutter / Dart
  '.dart_tool',
  '.pub-cache',
  '.fvm',
  'ephemeral',
  // Python
  '__pycache__',
  '.venv',
  'venv',
  'env',
  '.pytest_cache',
  '.mypy_cache',
  // PHP
  'vendor',
  // C / C++ / C# / Java / Rust
  'bin',
  'obj',
  'target',
  'cmake-build-debug',
  'cmake-build-release',
  '.gradle'
]);

// Ignored files (auto-generated, minified, or legacy archives)
const IGNORED_FILE_PATTERNS = [
  /\.min\.(js|css)$/i,
  /\.generated\./i,
  /\.g\.dart$/i,            // Flutter build runner generated files
  /\.freezed\.dart$/i,      // Freezed generated files
  /_legacy_vanilla_mvp/i    // Preserved legacy archives
];

let totalFilesChecked = 0;
const violations = [];
const warnings = [];

function isIgnoredFile(filename, relativePath) {
  for (const pattern of IGNORED_FILE_PATTERNS) {
    if (pattern.test(filename) || pattern.test(relativePath)) {
      return true;
    }
  }
  return false;
}

function scanDirectory(dir) {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        if (IGNORED_DIRECTORIES.has(entry.name) || entry.name.startsWith('.')) {
          continue;
        }
        scanDirectory(fullPath);
      } else if (entry.isFile()) {
        const ext = extname(entry.name).toLowerCase();
        const relativePath = fullPath.replace(PROJECT_ROOT, '').replace(/^[\\/]/, '');

        if (CODE_EXTENSIONS.has(ext) && !isIgnoredFile(entry.name, relativePath)) {
          totalFilesChecked++;
          const content = readFileSync(fullPath, 'utf-8');
          // Split by newline respecting CRLF and LF
          const lineCount = content.split(/\r\n|\r|\n/).length;

          if (lineCount > MAX_LINES) {
            violations.push({ path: relativePath, lineCount, ext });
          } else if (lineCount >= WARNING_THRESHOLD) {
            warnings.push({ path: relativePath, lineCount, ext });
          }
        }
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`Error scanning directory: ${dir}`, err.message);
    }
  }
}

// Automatically scan standard source directories if they exist, or the project root
const DEFAULT_SCAN_DIRS = ['src', 'lib', 'app', 'backend', 'api', 'services', 'scripts', 'supabase', 'tests', 'e2e'];
let scannedAnyDir = false;

for (const dirName of DEFAULT_SCAN_DIRS) {
  const dirPath = join(PROJECT_ROOT, dirName);
  if (existsSync(dirPath)) {
    scanDirectory(dirPath);
    scannedAnyDir = true;
  }
}

// Fallback: If no standard sub-directory is detected, scan project root selectively
if (!scannedAnyDir) {
  scanDirectory(PROJECT_ROOT);
} else {
  for (const entry of readdirSync(PROJECT_ROOT, { withFileTypes: true })) {
    if (!entry.isFile() || !CODE_EXTENSIONS.has(extname(entry.name)) || entry.name === 'next-env.d.ts') continue;
    const lines = readFileSync(join(PROJECT_ROOT, entry.name), 'utf8').split(/\r\n|\r|\n/).length;
    totalFilesChecked++;
    if (lines > MAX_LINES) violations.push({ path: entry.name, lineCount: lines, ext: extname(entry.name) });
  }
}

console.log(`\n🔍 Universal Line Ceiling Audit: Checked ${totalFilesChecked} files (Max: ${MAX_LINES} lines)`);
console.log(`🌐 Languages checked: TypeScript/JS, Dart/Flutter, Python, PHP, C/C++/C#, Go, Rust, Java, Kotlin, Swift, SQL.`);

if (warnings.length > 0) {
  console.log(`\n⚠️  Approaching Limit Warnings (>= ${WARNING_THRESHOLD} lines):`);
  for (const item of warnings) {
    console.log(`   - [${item.ext}] ${item.path}: ${item.lineCount} lines (Refactor recommended before hitting ${MAX_LINES})`);
  }
}

if (violations.length > 0) {
  console.error(`\n❌ VIOLATIONS FOUND: ${violations.length} file(s) exceed strict ${MAX_LINES} lines ceiling!`);
  for (const item of violations) {
    console.error(`   - [${item.ext}] ${item.path}: ${item.lineCount} lines (Exceeded by ${item.lineCount - MAX_LINES})`);
  }
  console.error(`\nAction required: Split or refactor the above files into modular units, services, or sub-components.\n`);
  process.exit(1);
} else {
  console.log(`✅ All files across all languages strictly comply with the ${MAX_LINES}-line ceiling rule!\n`);
  process.exit(0);
}

