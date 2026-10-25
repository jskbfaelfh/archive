// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file auto-setup-skills.mjs
 * @description Zero-touch orchestrator that automatically detects project type (Node, Flutter, Python, PHP, etc.)
 * and injects line-ceiling scripts, header validators, translation auditors, Git hooks, and package scripts.
 * @created 2026-09-23
 * @modified 2026-10-21
 */

import { existsSync, readFileSync, writeFileSync, chmodSync, readdirSync, statSync, mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

console.log('🚀 [Auto-Skills] Detecting project environment at:', PROJECT_ROOT);

let detectedTypes = [];

// 1. Check for Node.js / Web ecosystem
const packageJsonPath = join(PROJECT_ROOT, 'package.json');
if (existsSync(packageJsonPath)) {
  detectedTypes.push('Node.js / Web');
  try {
    const raw = readFileSync(packageJsonPath, 'utf-8');
    const pkg = JSON.parse(raw);
    pkg.scripts = pkg.scripts || {};

    let modified = false;
    
    // Core scripts
    if (!pkg.scripts['check:lines']) {
      pkg.scripts['check:lines'] = 'node scripts/check-line-limits.mjs';
      modified = true;
    }
    if (!pkg.scripts['check:headers']) {
      pkg.scripts['check:headers'] = 'node scripts/check-file-headers.mjs';
      modified = true;
    }
    if (!pkg.scripts['check:i18n']) {
      pkg.scripts['check:i18n'] = 'node scripts/deep_scan_translations.mjs';
      modified = true;
    }
    if (!pkg.scripts['ensure:playwright']) {
      pkg.scripts['ensure:playwright'] = 'node scripts/ensure-playwright.mjs';
      modified = true;
    }
    if (!pkg.scripts['test:e2e']) {
      pkg.scripts['test:e2e'] = 'node scripts/ensure-playwright.mjs && npx playwright test';
      modified = true;
    }
    if (!pkg.scripts['map:update']) {
      pkg.scripts['map:update'] = 'node scripts/update-project-map.mjs';
      modified = true;
    }
    if (!pkg.scripts['audit:all']) {
      pkg.scripts['audit:all'] = 'npm run check:lines && npm run check:headers && npm run check:i18n';
      modified = true;
    }

    // Auto-integrate into build
    const auditChain = 'node scripts/check-line-limits.mjs && node scripts/check-file-headers.mjs';
    if (pkg.scripts.build && !pkg.scripts.build.includes('check-file-headers')) {
      pkg.scripts.build = `${auditChain} && tsc -b && vite build`;
      modified = true;
    }

    if (modified) {
      writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2), 'utf-8');
      console.log('   ✅ [Node.js] Configured scripts (check:lines, check:headers, check:i18n, audit:all) in package.json.');
    } else {
      console.log('   ℹ️  [Node.js] package.json already fully configured.');
    }
  } catch (err) {
    console.warn('   ⚠️  Could not update package.json:', err.message);
  }
}

// 2. Check for Flutter / Dart
const pubspecPath = join(PROJECT_ROOT, 'pubspec.yaml');
if (existsSync(pubspecPath)) {
  detectedTypes.push('Flutter / Dart');
  console.log('   ✅ [Flutter/Dart] Detected pubspec.yaml.');
}

// 3. Check for Python
const pyprojectPath = join(PROJECT_ROOT, 'pyproject.toml');
const requirementsPath = join(PROJECT_ROOT, 'requirements.txt');
if (existsSync(pyprojectPath) || existsSync(requirementsPath)) {
  detectedTypes.push('Python');
  console.log('   ✅ [Python] Detected Python environment.');
}

// 4. Check for PHP / Composer
const composerJsonPath = join(PROJECT_ROOT, 'composer.json');
if (existsSync(composerJsonPath)) {
  detectedTypes.push('PHP / Composer');
  try {
    const raw = readFileSync(composerJsonPath, 'utf-8');
    const composer = JSON.parse(raw);
    composer.scripts = composer.scripts || {};
    composer.scripts['check:lines'] = 'node scripts/check-line-limits.mjs';
    composer.scripts['check:headers'] = 'node scripts/check-file-headers.mjs';
    writeFileSync(composerJsonPath, JSON.stringify(composer, null, 4), 'utf-8');
    console.log('   ✅ [PHP] Injected check scripts into composer.json.');
  } catch (err) {
    console.warn('   ⚠️  Could not update composer.json:', err.message);
  }
}

// 5. Automatic Git Pre-Commit Hook Injection
const gitHooksDir = join(PROJECT_ROOT, '.git', 'hooks');
if (existsSync(gitHooksDir)) {
  const preCommitHookPath = join(gitHooksDir, 'pre-commit');
  const hookScript = `#!/bin/sh
# Full-spectrum automated code audit
node scripts/check-line-limits.mjs && node scripts/check-file-headers.mjs
if [ $? -ne 0 ]; then
  echo "❌ Git commit blocked: Please resolve rule violations above."
  exit 1
fi
`;
  try {
    writeFileSync(preCommitHookPath, hookScript, 'utf-8');
    try { chmodSync(preCommitHookPath, 0o755); } catch (_) {}
    console.log('   ✅ [Git Hook] Pre-commit hook installed. Blocks commits failing header or line limits.');
  } catch (err) {
    console.warn('   ⚠️  Could not install Git hook:', err.message);
  }
}

// 6. Automatic Workspace Skills Synchronization (.agent-skills -> .agents/skills)
const agentSkillsSrc = join(PROJECT_ROOT, '.agent-skills');
const agentsSkillsDst = join(PROJECT_ROOT, '.agents', 'skills');
if (existsSync(agentSkillsSrc)) {
  try {
    const folders = readdirSync(agentSkillsSrc);
    let synced = 0;
    for (const folder of folders) {
      const srcFolder = join(agentSkillsSrc, folder);
      const dstFolder = join(agentsSkillsDst, folder);
      if (statSync(srcFolder).isDirectory()) {
        if (!existsSync(dstFolder)) mkdirSync(dstFolder, { recursive: true });
        for (const file of readdirSync(srcFolder)) {
          copyFileSync(join(srcFolder, file), join(dstFolder, file));
        }
        synced++;
      }
    }
    console.log(`   ✅ [Skills] Synchronized ${synced} workspace skills into .agents/skills.`);
  } catch (err) {
    console.warn('   ⚠️  Could not sync skills:', err.message);
  }
}

console.log(`\n🎉 [Auto-Skills Setup Complete] Ecosystems detected: [${detectedTypes.join(', ') || 'Generic'}]. All guards active!\n`);
