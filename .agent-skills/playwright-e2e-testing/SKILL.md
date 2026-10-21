---
name: playwright-e2e-testing
description: Trigger this skill whenever writing, executing, debugging, or verifying end-to-end (E2E), integration, or component UI tests using Playwright. Enforces automated environment prerequisite checks, installation verification, closed-loop error healing, and deterministic assertion patterns.
---

# Playwright E2E & Integration Testing Standards

## 1. Automated Environment Prerequisite Verification
Before writing or attempting to execute any test:
1. **Verify Installation:** Check if `@playwright/test` is installed in `package.json` and if browser binaries exist.
2. **Auto-Install if Missing:** If Playwright is not installed, install it automatically without asking:
   ```bash
   npm install -D @playwright/test
   npx playwright install --with-deps chromium
   ```
3. **Cross-Platform Headless Execution:** Always run Playwright in headless mode to guarantee reliable execution across Windows, Linux, macOS, and CI/CD pipelines:
   ```bash
   npx playwright test --reporter=list
   ```

## 2. 4-Stage Autonomous TDD & Verification Lifecycle
Every new component, interactive flow, or bug fix must complete this strict closed-loop cycle:

```
[1. Write/Modify Component] ──► [2. Write Playwright .spec.ts]
                                              │
                                              ▼
[4. Auto-Fix via Raw Error Log] ◄── [3. Execute: npx playwright test]
       (If Failure Occurs)                 │
               │                           ▼
               └──────────────────► [✅ 100% Pass Required]
```

### Stage 1: Component Development
Write the clean component adhering strictly to `code-architecture-standards` and `ui-ux-design-standards`.

### Stage 2: Target-Driven Specification (`.spec.ts`)
Write dedicated Playwright specs located in `e2e/` or adjacent `tests/` directories named `[feature].spec.ts`:
- **Header Line 1:** Must include the mandatory comment header:
  `// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف`
- **Standard Coverage Mandates:**
  - Dynamic Start-Border verification (rose-500 when empty, emerald-500 when filled).
  - Blocking invalid/empty submissions.
  - Portal-rendered tooltips and dropdowns (`z-index: 99999` and `body` mounting).
  - Font size compliance (minimum 13px).
  - Single-line constraints and marquee behavior on overflow.
  - English digits (0-9) validation.

### Stage 3: Autonomous Execution
Run the specific test target:
```bash
npx playwright test tests/[feature].spec.ts --reporter=list
```

### Stage 4: Closed-Loop Raw Error Healing (Token-Efficient Self-Correction)
- **Direct Error Log Ingestion:** If a test fails, parse the concise assertion failure block from the terminal output (e.g., `Expected border-s-emerald-500, received border-s-rose-500`).
- **Zero Full-Screen Dumps:** Never dump massive HTML dumps or screenshots into the prompt context.
- **Immediate Surgical Fix:** Correct the underlying component code or state machine, then immediately re-run the spec until full pass confirmation.

## 3. High-Standard Playwright Best Practices
- **Resilient Locators:** Prefer user-facing locators (`getByRole`, `getByLabel`, `getByText`) over brittle CSS classes or xpath.
- **Web-First Assertions:** Always use auto-retrying assertions (`await expect(locator).toBeVisible()`, `toHaveClass(...)`) rather than static timeouts.
- **No Hardcoded Sleep:** Strictly prohibit `page.waitForTimeout()`; use event/locator waiting.
