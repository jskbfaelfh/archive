---
name: ui-ux-design-standards
description: Trigger this skill whenever creating or editing UI components, modals, forms, dropdowns/selects, tooltips, dialogs, buttons, icons, or styling with Tailwind CSS in the University Timetables System. Enforces minimum 13px font, dynamic start-border without asterisks (*), 10px rounded modals, 7px inputs, React Portal for overlays, and stable layout rules.
---

# UI/UX & Visual Design Standards

## 1. Modern Visual Standards & Aesthetics
- **Rule 7 & 10 (Modern Visuals & Lucide Icons):** Use only modern, thin-line icons from `lucide-react`. Apply Glassmorphism effects (`backdrop-blur-md`, smooth transparencies, subtle shadows, and eye-comfort gradients).
- **Rule 11 (Full Responsiveness):** Full adaptability across small mobile, tablet, desktop, and ultrawide screens, including mobile sliding sidebars with dark overlays.
- **Rule 12 (Minimum Font Size):** Smallest font size allowed anywhere in the UI is **13px (`text-[13px]`)**. Scaling up via `sm:text-sm`, `md:text-base`. Tiny sizes (`10px`, `11px`) are strictly forbidden (except inside floated labels).

## 2. Windows, Modals, and Inputs Architecture
- **Rule 18 (Scrollbars & Modals):** Scrollbars must match theme color harmony, be edge-flush against modal boundaries, and use hover-reveal visibility (hidden by default, smooth on hover). Modals must feature smooth entrance scale & fade animations.
- **Rule 21 (Scrollbar Gutter Stability):** Apply `scrollbar-gutter: stable;` globally on `html` and `body` to prevent Cumulative Layout Shift (CLS) when scrollbars appear or disappear.
- **Rule 22 (Smart Skeleton Screens):** Render pages instantly if data is available. Never use artificial delays or unnecessary skeleton screens during rapid navigation. Use shimmer skeleton fallbacks only during actual slow network/server fetching.
- **Rule 23 (Smooth Entrance Motion):** Apply graceful entrance animation using cubic-bezier easing (`cubic-bezier(0.16, 1, 0.3, 1)`) combining Fade In, TranslateY, and Scale In. Abrupt appearances are forbidden.
- **Rule 24 (Modal Border Radius):** All modals, dialogs, and popups must have a default border radius of **10px** (`rounded-[10px]`).
- **Rule 25 (Centered Modal Positioning):** All modals must open **strictly centered** vertically and horizontally using flex layout.
- **Rule 26 (Input Border Radius):** All inputs, selects, and textareas must have a default border radius of **7px** (`rounded-[7px]`).
- **Rule 27 (Modal White Background):** All modals must have a pure white background (`bg-white dark:bg-slate-900`) by default.
- **Rule 28 (Input & Select Visual Effects):** Inputs and selects must feature subtle glows, soft rings, and micro-transitions on focus (`focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500`) and ultra-fine shadows (`shadow-2xs`).

## 3. Advanced Fields, Selects, and Labels
- **Rule 29 (Dynamic Start-Border Required Indicator & Zero Asterisk):**
  - **Strictly prohibit asterisks (`*`)** for required fields.
  - Required empty fields must display a **3px red start-border (`border-s-[3px] border-s-rose-500`)**.
  - Automatically transitions to **green (`border-s-[3px] border-s-emerald-500`)** once filled validly, and returns to red if emptied.
  - **Do & Don't:**
    - ❌ *Incorrect:* `<label>اسم المادة <span className="text-red-500">*</span></label>`
    - ✅ *Correct:* `<input className={clsx("rounded-[7px] border", isRequired && !value ? "border-s-[3px] border-s-rose-500" : "border-s-[3px] border-s-emerald-500")} />`
- **Rule 30 & 32 (Unified Dropdowns & Seamless Open State):**
  - Prohibit native browser `<select>`; use the centralized unified `Select` component system-wide.
  - When opened: bottom radius becomes `0` (`rounded-b-none`) to fuse perfectly with the dropdown list, top radius stays 7px. The dropdown menu has `border-none`, `shadow-xl`, top radius `0`, bottom radius 7px, and pure white background.
  - **Always on Top via React Portal:** Dropdown option lists must render via React Portal directly into `document.body` with `z-index: 99999` and fixed viewport positioning to escape any `overflow: hidden` containers, featuring smart auto-flipping.
- **Rule 33 (Default Outlined / Floated Field Label):**
  - Labels on all inputs/selects must default to Floated/Outlined style (`start-3 top-0 -translate-y-1/2`), with background matching container (`bg-white dark:bg-slate-900`), horizontal padding (`px-1.5`), and bold text (`text-[11px] font-bold`). Color reacts dynamically to focus (`text-blue-600`) or error (`text-rose-500`).
- **Rule 34 (Permission Display & Portal Tooltip):**
  - Display hierarchy/permission icon (`Shield`) with clean borders. Hovering spawns a popup tooltip rendered via React Portal in `document.body` (`z-index: 99999`) with glassmorphism (`backdrop-blur-md`), instant smooth appearance, and `pointer-events-none`.

## 4. UI Stability, Text Wrapping, and Dialogs
- **Rule 36 (Collapsed Sidebar Tooltips via Portal):** When sidebar is collapsed, hovering icons shows tooltips rendered via React Portal in `document.body` (`z-index: 99999`) with zero layout shift or sidebar vibration.
- **Rule 41 (Zero Native Browser Dialogs):** Prohibit `window.confirm`, `window.alert`, and `window.prompt` completely. Use custom confirmation modals matching design system specifications.
- **Rule 42 (Strict Single-Line Constraint & Smart Gentle Marquee):** 
  - Text (subject names, titles) must never wrap to a second line (`white-space: nowrap`).
  - If text overflows container width (`scrollWidth > clientWidth`), hovering activates a smooth gentle marquee scroll (4-8s duration) respecting language direction, returning smoothly on mouse leave. If no overflow, text remains completely stable.
- **Rule 43 (Smart Adaptive Searchable Dropdown - Threshold > 10):**
  - Dropdown lists must dynamically adapt based on option count: if `options.length > 10`, an embedded search input is rendered at the top of the portal menu (`sticky top-0`) with autofocus and instant client-side filtering. If `<= 10`, standard dropdown behavior without search box is strictly maintained.
  - Full details: `.agent-skills/smart-searchable-dropdown/SKILL.md`.
- **Rule 44 (Strict Phone Fields, Fixed Iraq Prefix +964 & 11/10 Digits Monitoring):**
  - **Zero Letters or Symbols:** Strictly reject any letter, special character, space, or symbol (`value.replace(/\D/g, '')`). Only digits (0-9) are allowed across keyboard events, inputs, and paste actions.
  - **Leading Zero Monitoring (11 digits with 0, 10 digits without 0):** Monitor leading zero: if the phone number starts with `0`, strictly allow a maximum of 11 digits. If it does not start with `0`, strictly allow a maximum of 10 digits. Extra digits beyond this limit are actively blocked on keystrokes and sanitized on input/paste.
  - **Fixed Iraq Prefix (+964) on Left:** The Iraq country code `+964` must remain pinned to the far left of the input field with the `+` sign on the far left edge (`+964`).
  - **Language-Direction Immunity:** The position of `+964` on the left side of the field must remain completely fixed and permanent, regardless of interface language switching (RTL Arabic or LTR English).
  - Use centralized component `PhoneInput` (`src/components/common/PhoneInput.tsx`) and validation utils (`src/utils/phoneValidation.ts`).
