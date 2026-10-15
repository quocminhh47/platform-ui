---
name: Technical LMS & Engineering Academy
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#4b41e1'
  on-secondary: '#ffffff'
  secondary-container: '#645efb'
  on-secondary-container: '#fffbff'
  tertiary: '#006058'
  on-tertiary: '#ffffff'
  tertiary-container: '#007b71'
  on-tertiary-container: '#b3fff3'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c3c0ff'
  on-secondary-fixed: '#0f0069'
  on-secondary-fixed-variant: '#3323cc'
  tertiary-fixed: '#89f5e7'
  tertiary-fixed-dim: '#6bd8cb'
  on-tertiary-fixed: '#00201d'
  on-tertiary-fixed-variant: '#005049'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.025em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 42px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies a modern, precise, and intellectually rigorous EdTech platform tailored for software engineers, systems architects, and cloud practitioners. Drawing visual maturity from high-end developer platforms and developer documentation (Stripe, Vercel, Frontend Masters), the interface balances systematic clarity with approachable modern elegance.

### Emotional Target
- **Competence & Trust**: Every layout decision projects authoritative technical depth without unnecessary decoration or cognitive noise.
- **Clarity & Focus**: High-contrast legibility, calm backgrounds, and crisp typographic hierarchies ensure frictionless code review, deep reading, and interactive terminal exercises.
- **Momentum**: Tactile progress indicators, subtle state feedback, and structured skill graphs motivate continuous professional mastery.

### Design Direction
A refined blend of **Modern Enterprise** and **Clean Minimalist Utility**:
- Crisp, razor-sharp 1px neutral structural borders.
- Subdued, layered light slate canvas tiers (`#F8FAFC` to `#FFFFFF`).
- High-precision vibrant sapphire and indigo accents that denote interaction, syntax focus, and linear progress.
- Clean, ergonomic rounded corners balanced with pill-shaped metadata chips to categorize architectures, cloud SDKs, and difficulty tiers.

## Colors

The color palette prioritizes optical comfort during sustained study, distinct interactive states, and syntax-level legibility.

### Canvas & Surface Hierarchy
- **Canvas Base (`#F8FAFC`)**: Soft slate used as the full-viewport app backdrop to minimize eye strain compared to harsh stark white.
- **Surface Elevated (`#FFFFFF`)**: Primary layer for interactive cards, sidebars, curriculum panels, and editor modules.
- **Surface Subdued (`#F1F5F9`)**: Neutral background for code blocks, terminal header bars, input fields, and disabled regions.

### Text & Iconography Hierarchy
- **Primary Text (`#0F172A`)**: High-contrast deep slate for headings, primary data, and active interface labels.
- **Secondary Text (`#334155`)**: Mid slate for curriculum descriptions, module body copy, and secondary metrics.
- **Muted / Metadata Text (`#64748B`)**: Neutral slate for timestamps, course prerequisites, keyboard shortcuts, and breadcrumb trails.
- **Border Subtle (`#E2E8F0`)**: Low-contrast boundaries cleanly delineating layout tiers without visual fragmentation.

### Brand & Functional Accents
- **Primary Sapphire (`#2563EB`)**: Anchor color for primary actions, current course progress, and active track nodes. Hover shifts down to deep navy blue (`#1D4ED8`).
- **Secondary Indigo (`#4F46E5`)**: Applied to specialized achievements, milestone tags, interactive sandboxes, and verification badges.
- **Tertiary Teal (`#0D9488`)**: Dedicated to verified labs, system operational statuses, and completed curriculum modules.
- **Feedback Accents**: Emerald (`#059669`) for passing unit tests; Amber (`#D97706`) for cloud resource warnings; Rose (`#E11D48`) for build errors or test failures.

## Typography

The typography pairs **Plus Jakarta Sans** for headlines and high-level milestones with **Inter** for dense interface controls, interactive lessons, documentation, and technical exercises.

### Typographic Principles
- **Headings & Display**: Set in Plus Jakarta Sans with negative letter tracking to produce a confident, modern architectural cadence. Keep headings clear, succinct, and structured logically (H1 for lesson overview, H2 for syllabus sections, H3 for submodules).
- **Body & Functional Text**: Inter is configured with neutral tabular characteristics and comfortable line heights (`1.5` to `1.625`) to support extended sessions of technical reading and code walkthroughs without visual fatigue.
- **Code & Syntax**: While interface elements use Inter, inline keywords, commands, and code blocks use an industry monospaced companion font (such as `JetBrains Mono` or system mono) scaled down by 1px relative to adjacent body text, paired with a subtle slate surface chip.

## Layout & Spacing

The layout is built upon an 8-point base grid system combined with a 12-column responsive fluid grid inside structured container boundaries (maximum width: 1440px).

### Breakpoints & Responsive Adaptation
- **Desktop (>= 1280px)**: 12-column grid, `margin: 2rem`, `gutter: 1.5rem`. Supports 3-tier layouts (collapsible left-hand syllabus/module tree, central reading/video canvas, and right-hand terminal sandbox or notes drawer).
- **Tablet (768px - 1279px)**: 8-column grid, `margin: 1.5rem`, `gutter: 1.25rem`. The syllabus collapses into a slide-over navigation sheet, while the central video/canvas stack remains front and center.
- **Mobile (< 768px)**: 4-column grid, `margin: 1rem`, `gutter: 1rem`. Multi-column grids reflow into a clean, vertical single-column stack. Sticky tab controls at the bottom handle toggling between instruction text, video, and code outputs.

### Space Rhythm
- **Micro Spacing (`space-xs`, `space-sm`)**: Applied strictly to badge paddings, button internal alignments, icon-to-label gaps, and metadata rows.
- **Component Spacing (`space-md`, `space-lg`)**: Applied to card interior padding, syllabus row gaps, form element separation, and dialog interior margins.
- **Macro Spacing (`space-xl`)**: Applied between major module sections, dashboard overview grids, and milestone progression bands.

## Elevation & Depth

Visual hierarchy relies on structural 1px slate borders combined with ambient, diffused drop shadows. This creates a grounded, tactile atmosphere reminiscent of high-end developer documentation rather than floaty, generic software.

### Depth Hierarchy
- **Level 0 (Flat / Canvas)**:
  - Surface: `#F8FAFC`.
  - Border: None.
  - Shadow: None.
  - Use: Full viewport backgrounds, base layout tracks.

- **Level 1 (Card / Resting)**:
  - Surface: `#FFFFFF`.
  - Border: 1px solid `#E2E8F0`.
  - Shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)`.
  - Use: Course cards, syllabus containers, lesson text panels, and filter toolbars.

- **Level 2 (Card Hover / Interactive Focus)**:
  - Surface: `#FFFFFF`.
  - Border: 1px solid `#CBD5E1`.
  - Shadow: `0 8px 20px -4px rgba(15, 23, 42, 0.07), 0 4px 8px -2px rgba(15, 23, 42, 0.03)`.
  - Transform: `-1px` subtle translation on the Y-axis.
  - Use: Interactive course catalog cards on hover, active drop-down lists.

- **Level 3 (Overlay / Modal / Flyout Terminal)**:
  - Surface: `#FFFFFF`.
  - Border: 1px solid `#E2E8F0`.
  - Shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)`.
  - Use: Code completion overlays, modal dialogs, search command palettes (Cmd+K).

## Shapes

The platform adopts a geometric balance between purposeful technical structure and welcoming modern friendliness.

### Shape Scale
- **Base Components (`rounded-md` / 0.5rem - 8px)**: Used for buttons, inputs, dropdown menus, and standard interactive controls. Ensures technical precision and compact UI density.
- **Card Containers (`rounded-xl` / 1rem - 16px)**: Standard for content panels, course track modules, video containers, and practice quiz sheets.
- **Hero & Modal Surfaces (`rounded-2xl` / 1.5rem - 24px)**: Outer wrappers for course overview banners, interactive sandbox windows, and terminal frame dialogs.
- **Full Pill (`rounded-full` / 9999px)**: Reserved for tech-stack indicators, skill tags (e.g., `Kubernetes`, `TypeScript`, `AWS`), lesson duration badges, and learner avatars.

## Components

### Buttons
- **Primary**: Solid Sapphire `#2563EB` background with white text, `border: none`, `border-radius: 0.5rem`, `padding: 0.625rem 1.25rem`. On hover, transitions smoothly to `#1D4ED8` with a soft ambient glow. Active scale: `0.98`.
- **Secondary**: `#FFFFFF` background, `border: 1px solid #E2E8F0`, text color `#334155`. On hover: surface transitions to `#F8FAFC` and border shifts to `#CBD5E1`.
- **Ghost / Subtle**: Transparent background, text color `#64748B`. On hover: background becomes `#F1F5F9`, text color darkens to `#0F172A`.

### Chips & Pill Badges
- **Tech Stack Badges**: Pill-shaped (`rounded-full`), height `24px`, padding `0 0.75rem`, font size `11px`, `font-weight: 600`, letter spacing `0.04em` uppercase.
  - Neutral / Architecture: `#F1F5F9` background, `#334155` text, subtle `1px solid #E2E8F0`.
  - Sapphire / Advanced Track: `#EFF6FF` background, `#1D4ED8` text, `1px solid #BFDBFE`.
  - Teal / Cloud Practical: `#F0FDFA` background, `#0D9488` text, `1px solid #99F6E4`.

### Cards & Lesson Tiles
- Built with a `#FFFFFF` core surface, `1px solid #E2E8F0` border, and `rounded-xl` corners.
- Padding uses `space-lg` (1.5rem).
- Features a bottom or top hairline 2px progress bar indicating current completion percentage (Sapphire `#2563EB` for active progress; Slate `#F1F5F9` for remaining track).

### Checkboxes & Radio Buttons
- **Checkbox**: `18px × 18px`, `rounded-md` (4px radius), `1.5px solid #CBD5E1` border. When checked: `#2563EB` background with crisp white checkmark SVG.
- **Radio**: `18px × 18px`, `rounded-full`, with an inner concentric dot (`6px`) tinted in `#2563EB` on select.

### Input Fields & Search Command Bars
- Height: `42px`, padding: `0 0.875rem`, `rounded-md`.
- Background: `#FFFFFF`, border: `1px solid #CBD5E1`, text: `#0F172A`.
- Placeholder text: `#94A3B8`.
- Focus state: `border-color: #2563EB` with an external focus ring: `0 0 0 3px rgba(37, 99, 235, 0.15)`.

### Lists & Syllabus Trees
- Bordered modular list groups with `#E2E8F0` separators.
- Each curriculum row features an icon indicating state (Lock, Play Circle, Check Circle), lesson title in `Inter 14px Medium`, estimated duration (`Inter 12px Regular #64748B`), and an optional code snippet pill badge.
- Hovering a lesson item initiates an instant surface change to `#F8FAFC`.

### Specialized Domain Components
- **Code Snippet Panel**: Dark-on-light or light neutral container (`#F8FAFC`) with top toolbar holding file title (`Inter 12px Bold`), line counts, and a copy-to-clipboard action.
- **Terminal Drawer**: Fixed height bottom runner with `#0F172A` deep slate background, monospaced outputs, and emerald `#10B981` status markers for real-time sandbox feedback.