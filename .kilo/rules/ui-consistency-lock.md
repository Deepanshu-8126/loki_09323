# UI Consistency & Design System Lock (Zero Style Drift Protocol)
Enforces permanent visual consistency across all pages, subpages, modals, and components.

---

## 1. The Core Law: "Single Source of Truth"
When creating Page 2, Page 3, or any new component, **NEVER invent new styles from scratch**.
- **Mandatory Step Before Coding UI:** Inspect the project's existing global CSS (`globals.css`, `index.css`, `styles.css`, or Page 1).
- **Zero Style Drift:** The new page MUST look like it was created by the exact same designer, in the exact same design system, on the exact same day.

---

## 2. Typography Lock (Never Change Fonts Between Pages)
- **Global Font Inheritance:** Every page, modal, and drawer MUST inherit the project's primary typography tokens:
  - Heading font: `var(--font-heading, var(--font-sans))`
  - Body font: `var(--font-sans, 'Inter', system-ui, sans-serif)`
  - Monospace (code/numbers): `var(--font-mono, 'JetBrains Mono', monospace)`
- **Strictly Banned:**
  - Injecting a different `@import url(...)` or `<link>` font on subpages.
  - Declaring ad-hoc `font-family: Arial` or `font-family: Roboto` on one page when another page uses `Inter` or `Outfit`.
  - Inconsistent font sizes: Always follow the standard SaaS scale:
    - Page Titles: `24px - 28px` (weight: 700-800)
    - Section Headers: `16px - 18px` (weight: 600-700)
    - Body Text: `13px - 14px` (weight: 400-500)
    - Micro Labels/Badges: `11px - 12px` (weight: 600, tracking: 0.05em)

---

## 3. Design Tokens Lock (No Raw Hex Inconsistencies)
All colors and geometries across every single page MUST consume CSS custom properties:

```css
:root {
  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Color Canvas */
  --bg-app: #090a0f;
  --bg-surface: #12141c;
  --bg-surface-elevated: #1a1d29;
  --bg-surface-hover: #222636;
  
  /* Borders & Dividers */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.16);
  
  /* Text */
  --text-primary: #f3f4f6;
  --text-secondary: #9ca3af;
  --text-muted: #6b7280;
  
  /* Brand / Accent */
  --accent-primary: #3b82f6;
  --accent-primary-hover: #2563eb;
  
  /* Radii */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-pill: 9999px;
}
```

- **Strictly Banned:**
  - Writing raw hex colors (e.g. `color: #333` on Page A and `color: #4a4a4a` on Page B).
  - Writing hardcoded border-radius (e.g. `border-radius: 4px` on Page A and `border-radius: 12px` on Page B). Use `var(--radius-md)`.

---

## 4. Layout & Rhythm Consistency
- **Container Max-Width:** If Page 1 uses `max-width: 1200px; margin: 0 auto;`, Page 2 must not use `max-width: 1400px` or full-bleed unless intentionally full-width.
- **Button Standards:** All primary buttons across all pages must share:
  - Exact same height (`38px` or `42px`), padding (`8px 16px`), border-radius (`var(--radius-md)`), and font-weight (`600`).
- **Cards & Shadows:** Cards across all subpages must share the exact same background (`var(--bg-surface)`), border (`1px solid var(--border-subtle)`), and corner radius.

---

## 5. Pre-Flight Verification Checklist Before Answering
Before providing UI code for any new view or subpage, verify:
1. [ ] Did I check the existing global stylesheet or Page 1?
2. [ ] Are all font families and heading weights identical to Page 1?
3. [ ] Are all background, surface, text, and border colors mapped to CSS variables?
4. [ ] Are button heights, input paddings, and card radii matching the baseline?
