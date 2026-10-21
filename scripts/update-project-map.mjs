// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file update-project-map.mjs
 * @description Inventory the actual reference-data application without secrets or generated files.
 * @created 2026-09-26
 * @modified 2026-10-18
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ignored = new Set(['node_modules', '.git', '.next', '.work', '.manus', 'dist', 'build', 'coverage',
  'test-results', 'playwright-report']);
function scan(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = resolve(dir, entry.name);
    if (entry.isSymbolicLink() || ignored.has(entry.name)) return [];
    if (entry.isDirectory()) return scan(path);
    return entry.isFile() && !entry.name.startsWith('.env') && !entry.name.endsWith('.tsbuildinfo') ? [path] : [];
  });
}
const files = scan(root).map(path => relative(root, path).replace(/\\/g, '/')).sort();
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const deps = { ...pkg.dependencies, ...pkg.devDependencies };
const stack = ['next', 'react', 'typescript', 'tailwindcss', '@supabase/supabase-js', 'zod', '@playwright/test']
  .filter(name => deps[name]).map(name => `- **${name} ${deps[name]}**`).join('\n');
const groups = new Map();
for (const file of files) {
  const parts = file.split('/');
  const group = parts.length === 1 ? 'root' : parts[0] === 'src' ? parts.slice(0, 2).join('/') : parts[0];
  groups.set(group, (groups.get(group) ?? 0) + 1);
}
const links = entries => entries.length ? entries.map(path => `- [\`${path}\`](${path})`).join('\n') : 'لا توجد ملفات في هذا النطاق.';
const content = `# خريطة بنية المشروع (PROJECT_MAP.md)
## منظومة الهيكلية المركزية وإدارة البيانات المرجعية للجامعة

**تاريخ التحديث الآلي:** ${new Date().toISOString()}
**إجمالي الملفات غير المولدة:** ${files.length}
**حدود الخريطة:** جرد ملفات؛ لا يمثل إثبات صحة الوظائف أو جاهزية الإنتاج. يستثني الأسرار والتبعيات وملفات العمل المولدة.

### المكدس التقني
${stack}

### توزيع الملفات
| المجلد | العدد |
|---|---:|
${[...groups].map(([name, count]) => `| \`${name}\` | ${count} |`).join('\n')}

### واجهات التطبيق (Vite + React)
${links(files.filter(path => /^src\/(?:App|main|components\/.*)\.tsx$/.test(path)))}

### خدمات البيانات والمصادقة
${links(files.filter(path => path.startsWith('src/services/') || path.startsWith('src/hooks/')))}

### قاعدة البيانات والدوال
${links(files.filter(path => path.startsWith('supabase/')))}

### الاختبارات
${links(files.filter(path => path.startsWith('tests/') || path.startsWith('e2e/')))}

### التوثيق
${links(files.filter(path => path.startsWith('docs/') || ['README.md', 'DOCUMENTATION.md', 'TODO.md'].includes(path)))}

### قواعد المشروع
- جميع الملفات والتنزيلات والسجلات داخل مجلد النظام.
- سقف 300 سطر لكل ملف كود، والترويسة المعتمدة، وTypeScript الصارم والتحقق وقت التشغيل.
- بيانات الكادر الحساسة تخضع للنطاق والصلاحية؛ قاعدة البيانات هي سلطة التفويض النهائية.
- الأرقام الغربية 0-9 والترجمة العربية والإنجليزية والمكونات المشتركة الميسرة.
- لا تنفيذ ترحيلات أو اختبارات كتابية على الإنتاج دون إجراء نشر مصرح وآمن.
- هذه نواة بيانات مرجعية؛ وظائف الجداول والحضور أنظمة فرعية تتصل عبر عقود تكامل.
`;
writeFileSync(resolve(root, 'PROJECT_MAP.md'), content, 'utf8');
console.log(`تم تحديث خريطة النظام: ${files.length} ملفًا غير مولد.`);
