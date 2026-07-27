# DESIGN.md — Visual Design System

## AI-Integrated College ERP System

This document defines the visual language of the application — colors, typography, spacing, and component patterns — so the UI stays consistent as new pages and features are added.

---

## 1. Design Philosophy

The interface intentionally avoids the generic "SaaS blue dashboard" look common to admin-panel templates. Since this is a **college** ERP, the visual identity leans into an academic/institutional feel — a serif display typeface, a deep navy + maroon palette (evoking university branding), and warm paper-toned backgrounds instead of stark white.

**Guiding principle:** one confident accent color (maroon), used sparingly and deliberately — not scattered across every interactive element.

---

## 2. Color Palette

### 2.1 Core Tokens

| Token | Hex | Usage |
|---|---|---|
| `ink` | `#1B2333` | Sidebar background, primary headings, dark-mode base |
| `ink-light` | `#2A3547` | Sidebar hover states |
| `paper` | `#FAF9F6` | Main content background (light mode) |
| `maroon` | `#8C2F39` | Primary accent — buttons, active nav item, links |
| `maroon-light` | `#A8434E` | Hover/lighter variant |
| `maroon-dark` | `#6E2029` | Pressed/darker variant, button hover |

### 2.2 Role Accent Colors

Each user role gets a distinct accent color, used for stat card icons, badges, and role-specific highlights — allowing a screenshot or demo to instantly communicate "whose view is this":

| Role | Token | Hex | Feel |
|---|---|---|---|
| Admin | `role-admin` | `#8C2F39` | Maroon — authority |
| Faculty | `role-faculty` | `#3D6B5C` | Deep green — growth/teaching |
| Student | `role-student` | `#2C5C8C` | Deep blue — calm/learning |

### 2.3 Dark Mode Tokens

| Token | Hex | Usage |
|---|---|---|
| `ink-dark-bg` | `#14181F` | Main background in dark mode |
| `ink-dark-surface` | `#1B2130` | Card/navbar surface in dark mode |
| `paper-dark` | `#E8E6E0` | Text color in dark mode |

### 2.4 Semantic Colors

| Purpose | Color |
|---|---|
| Success / Present | `role-faculty` green |
| Error / Absent / Destructive | `maroon` |
| Neutral text | `ink` at reduced opacity (`/50`, `/60`, `/70`) |

---

## 3. Typography

| Role | Font | Usage |
|---|---|---|
| **Display** | `Fraunces` (serif) | Page titles, card headings, brand name — gives the "institutional" feel |
| **Body** | `Inter` (sans-serif) | Form labels, body text, table content, buttons |

Loaded via Google Fonts in `index.html`:
```html
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

**Rule:** Headings always use `font-display`; everything else (labels, inputs, tables, buttons) uses `font-body`. Never mix them within the same text element.

---

## 4. Layout

### 4.1 Structure

```
┌─────────────┬──────────────────────────────┐
│             │  Navbar (user, bell, theme,   │
│  Sidebar    │  role badge, logout)          │
│  (fixed,    ├──────────────────────────────┤
│  w-64,      │                               │
│  dark)      │  Main content (p-6)           │
│             │                               │
└─────────────┴──────────────────────────────┘
```

Every authenticated page is wrapped in `DashboardLayout`, which composes `Sidebar` + `Navbar` + page content — no page builds its own layout shell.

### 4.2 Spacing Scale

Standard Tailwind spacing scale used throughout — no arbitrary pixel values. Cards consistently use `p-6`, gaps between grid items use `gap-6`, form field spacing uses `space-y-4`.

### 4.3 Border Radius

- Cards: `rounded-lg`
- Buttons, inputs: `rounded`
- Badges, avatars: `rounded-full`

---

## 5. Component Patterns

### 5.1 Cards

```
bg-white rounded-lg shadow-sm border border-ink/10 p-6
hover:shadow-md hover:-translate-y-0.5 transition-all
```

Every card gets a subtle hover lift — a small detail that makes static dashboards feel responsive to the cursor.

### 5.2 Stat Cards (icon-in-circle pattern)

```
[Circle icon, tinted 10% of role color] [Label + large display-font number]
```

The icon circle uses the role/context color at `/10` opacity for the background and full-strength for the icon itself — a soft "badge" look rather than a harsh icon on white.

### 5.3 Buttons (primary)

```
bg-maroon text-white px-4 py-2 rounded font-body text-sm
hover:bg-maroon-dark hover:scale-[1.02] transition-all
```

### 5.4 Forms

- Labels: `text-sm font-body text-ink/60`, always above the input
- Inputs: `border border-ink/15 rounded px-3 py-2 font-body text-sm`
- Focus state: `focus:ring-2 focus:ring-maroon/40 focus:border-maroon/40`

### 5.5 Tables

- Header row: `border-b border-ink/10 text-ink/50`, no background fill
- Row separators: `border-b border-ink/5`
- Row hover: `hover:bg-paper/50 transition-colors`

### 5.6 Empty States

Never a bare "No data" string — always paired with a muted icon and a complete sentence:
```
[Icon, text-ink/20, size 32] 
"No notices yet."
```

### 5.7 Loading States

Skeleton placeholders (`animate-pulse` gray boxes shaped like the real content), never a plain "Loading..." string. The skeleton's layout should approximate what's about to render, so the loading → loaded transition feels seamless.

### 5.8 Charts

- Bar charts: maroon or role-color fill, `radius={[6, 6, 0, 0]}` (rounded top corners only)
- Pie/donut charts: role-color palette, tooltip and legend styled with `font-family: Inter`
- All chart text uses `Inter` at `fontSize: 11-13` to match the body typography, never the chart library's default font

---

## 6. Animation

Two custom keyframes, used sparingly:

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

Applied only to first-load moments (Login/Register form and illustration) — not layered onto every page transition, which would feel excessive rather than polished.

---

## 7. Dark Mode Rules

- Toggled via a `dark` class on `<html>`, controlled by `ThemeContext`, persisted to `localStorage`
- Every component using `ink`/`paper` tokens must pair them with a `dark:` variant (e.g., `bg-paper dark:bg-ink-dark-bg`)
- Role accent colors (maroon, role-admin, role-faculty, role-student) stay the same in both modes — only the neutral background/surface/text tokens shift

---

## 8. Iconography

`lucide-react` exclusively — consistent stroke width (`1.75`) and style across the entire app. Icons are never mixed with emoji (an earlier draft used 🔔 for the notification bell; this was replaced with the `Bell` icon component for visual consistency with the rest of the sidebar/navbar icons).

| Context | Icon |
|---|---|
| Dashboard | `LayoutDashboard` |
| Students | `Users` |
| Departments | `Building2` |
| Attendance | `ClipboardCheck` |
| Results | `GraduationCap` |
| Notices | `Bell` |
| Dark mode toggle | `Sun` / `Moon` |
| Delete action | `Trash2` |
| Edit action | `Pencil` |
| AI summary marker | `Sparkles` |

---

## 9. Illustration

A single custom flat-style SVG illustration (campus building, graduate figure, book icon) used on both Login and Register pages, rendered in the same navy/maroon palette as the rest of the app — chosen over a stock illustration to keep the visual language fully custom and cohesive.