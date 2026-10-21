---
name: domain-and-localization-standards
description: Trigger this skill whenever handling numbers, dates, times, strings, UI copy, translations, i18n dictionaries (src/i18n/), search logic, or URL/page state persistence in the University Timetables System. Enforces Western Arabic digits (0-9), 100% bilingual translation, zero raw keys, zero technical jargon, and full-text search.
---

# Domain, Localization & Data Standards

## 1. Strict English Numerals (0-9) Everywhere
- **Rule 7 & 15 (Mandatory Western Digits):** 
  - **Strictly prohibit Eastern/Indic numerals (٠، ١، ٢، ٣، ٤، ٥، ٦، ٧، ٨، ٩)** in any part of the system under any language setting (Arabic or English).
  - Use Western Arabic numerals (`0, 1, 2, 3, 4, 5, 6, 7, 8, 9`) exclusively for dates, lecture times, statistics, student counts, teaching loads, room counts, academic stages, IDs, inputs, tables, and notifications.
  - Pass all numbers and dates through the unified formatting utility `formatEnglishNumber()`.
  - **Do & Don't:**
    - ❌ *Incorrect:* `<span>الساعة: ٠٨:٣٠ صباحاً</span>`
    - ✅ *Correct:* `<span>الساعة: {formatEnglishNumber("08:30")} صباحاً</span>`

## 2. Complete Bilingual Support & Zero Raw Keys
- **Rule 17 & 40 (Universal 100% Translation & Zero Raw Keys):**
  - Mandatory translation coverage across all modals, dialogs, drawers, and UI components (`QuickRoleSwitcher`, `LectureModal`, `CreateTimetableModal`, `CollegeModal`, `DepartmentModal`, `FacultyModal`, `StaffModal`, etc.).
  - **Strictly prohibit raw technical keys** (e.g., `role_category_presidency`, `slot_1`, `college_label`) from appearing in user interfaces.
  - Every key must be registered simultaneously in Arabic and English dictionaries (`src/i18n/ar/` and `src/i18n/en/`).
  - Translation engine (`useTranslation`) must fallback gracefully with zero raw keys leakage. Code must undergo automated translation auditing (`deep_scan_translations.cjs`) ensuring **0 Missing Keys**.
  - **Do & Don't:**
    - ❌ *Incorrect:* `<button>{t('save_button') || 'save_button'}</button>`
    - ✅ *Correct:* Ensure key `save_button` is populated in both `src/i18n/ar/` and `src/i18n/en/` before rendering.

## 3. Institutional Identity & Dynamic Configuration
- **Rule 31 (Centralized Institutional Setup):**
  - University name must be fetched exclusively from central system configuration (`systemConfig.universityNameAr` and `universityNameEn`), never hardcoded.
  - Navbar must display current academic year and semester below university name. Sidebar header displays system name only ("منظومة الجداول الجامعية").
  - Teaching days must be dynamically configured from settings (`workingDays: sat, sun, mon, tue, wed, thu, fri`).

## 4. Navigation, Search & State Persistence
- **Rule 19 & 20 (Faithful UI Parity):** Timetable grid structure must strictly maintain original layout (Columns = Time Slots, Rows = Days, First Column = Day/Time, accurate color badges, monospace course codes).
- **Rule 35 (Page Persistence on Reload):** Refreshing the page (F5) must never redirect the user back to dashboard. Implement Dual Sync Mechanism via `window.location.hash` and `localStorage` (`alzahrawi_active_page`, `alzahrawi_selected_timetable_id`) across all 8 core pages.
- **Rule 39 (Mandatory Full-Text Search):** Search inputs must perform comprehensive full-text search across all linked entity fields. In timetable views, matching results across tabs must trigger automatic intelligent tab switching.

## 5. Professional Copywriting & Tone
- **Rule 38 (Absolute Prohibition of Technical Jargon in User-Facing Copy):**
  - User-facing text, alerts, error messages, and tooltips are targeted at academics and administrators.
  - **Strictly prohibit technical or architecture jargon** (e.g., *"protected on frontend, backend, and database"*, "Frontend", "Backend", "API", "Endpoints", "Schema", "Controllers", "Algorithm", "Matrix").
  - Copy must remain strictly professional, academic, direct, and procedure-oriented. Technical terms are strictly restricted to code comments, developer logs, and internal documentation (`docs/`).
  - **Do & Don't:**
    - ❌ *Incorrect alert:* "فشل الاتصال بالـ Backend API وتم رفض الـ Schema"
    - ✅ *Correct alert:* "تعذر حفظ البيانات في السجل الأكاديمي، يرجى إعادة المحاولة"
