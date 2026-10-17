---
name: Modern EdTech Assessment
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
  on-surface-variant: '#464555'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#005338'
  on-tertiary: '#ffffff'
  tertiary-container: '#006e4b'
  on-tertiary-container: '#67f4b7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.005em
  character-display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '500'
    lineHeight: 56px
    letterSpacing: 0.02em
  character-display-mobile:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '500'
    lineHeight: 44px
    letterSpacing: 0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes a high-focus, premium pedagogical environment for Chinese language acquisition tailored to Vietnamese learners. The aesthetic is grounded, contemporary, and disciplined—merging modern software precision with deliberate cognitive pacing. It eliminates extraneous gamified clutter in favor of crisp visual hierarchy, high legibility for tonal markers and multi-script typography (Latin, Pinyin, and Hanzi), and reassuring tactile feedback.

The target audience comprises ambitious university students, working professionals, and self-directed learners preparing for HSK certification or professional bilingual fluency. The interface must evoke confidence, focus, intellectual rigor, and an immediate sense of structured progress without visual anxiety or infantile styling.

The design movement combines **Corporate / Modern refinement** with **Tactile micro-feedback**:
- Pure white container cards resting on a cool, low-saturation canvas.
- Crisp single-pixel structural borders replacing heavy decorative strokes.
- High-contrast authoritative slate framing anchoring the navigation hierarchy.
- Direct, predictable interactive feedback on touch and click states to validate complex linguistic selections.

## Colors

The palette balances deep intellectual authority with clear state signaling. Light mode is the default, maintaining optimal contrast and clarity during long reading and character-recognition sessions.

### Functional Roles
- **Primary Indigo (`#4F46E5` base, `#4338CA` active/hover):** Drives primary actions, question progression, selected option fills, and high-priority learning metrics.
- **Header & Structural Slate (`#0F172A` root, `#1E293B` elevated):** Anchors headers, persistent navigation bars, and top-level utility panels, creating an authoritative canopy over the reading workspace.
- **Success Emerald (`#10B981` default, `#059669` dark/text):** Validates correct answers, passing scores, mastery milestones, and progress streaks.
- **Warning Amber (`#F59E0B` base, `#D97706` dark):** Designates running timers nearing expiration, partial credit, and warning flags.
- **Critical Rose (`#F43F5E` base, `#E11D48` dark):** Identifies incorrect answer options, critical review alerts, and audio playback errors.
- **Canvas & Surface Neutrals:**
  - Background Canvas: `#F8FAFC`
  - Card & Container Fill: `#FFFFFF`
  - Subtle Borders & Dividers: `#E2E8F0`
  - Interactive Inactive Outlines: `#CBD5E1`
  - High-Contrast Text: `#0F172A`
  - Body Text: `#334155`
  - Subdued / Metadata: `#64748B`

## Typography

The typographic engine uses Inter with fallback support for Vietnamese diacritics and CJK ideographs (via system Noto Sans SC / PingFang SC fallbacks). Line heights maintain generous vertical breathing room to accommodate tone marks (Pinyin: ā, á, ǎ, à) and Vietnamese tone markers (hỏi, ngã, nặng) without clipping accents or colliding lines.

### Typographic Principles
- **Character Prominence:** Chinese characters under evaluation utilize the `character-display` token, ensuring stroke order clarity and radical legibility.
- **Bilingual Stacking:** Vietnamese instructional copy and Chinese target strings should always maintain a strict visual relationship: Vietnamese body text remains regular weight (`400`), while Chinese prompts adopt medium weight (`500` or `600`) to balance optical density.
- **Tabular Numerals:** Timers, scores, and question trackers must employ `font-variant-numeric: tabular-nums` to eliminate layout jitter during active countdowns.

## Layout & Spacing

The layout is built around a focused assessment column designed to prevent cognitive fatigue and eye strain during sustained testing.

### Layout Model
- **Quiz Main Frame:** Constrained to a max-width of `896px` (56rem) centered within the viewport. Full-bleed backgrounds are restricted to utility headers and modal footers.
- **Dual-Pane Split (Desktop > 1024px):** When displaying comprehension passages or audio transcripts alongside questions, the layout splits into an asymmetric 5:7 grid with a `1.5rem` (`gutter`) gap.
- **Spacing Rhythm:** Standard spacing operates on an 8pt base grid with a 4pt sub-grid for badges, radio controls, and input tags.

### Breakpoint Structure
- **Mobile (< 640px):** Single-column layout. Margin snaps to `1rem` (`margin-sm`). Question options stack vertically. Sticky bottom action bar for navigation controls.
- **Tablet (640px – 1023px):** Margin expands to `1.5rem`. Question options arrange into a 2-column grid when options are brief (single words/characters).
- **Desktop (≥ 1024px):** Fixed header bar, `2rem` outer page margins, dedicated question jump matrix on the right rail or accessible via a secondary toggle sheet.

## Elevation & Depth

This design system avoids heavy drop shadows, relying instead on high-precision structural boundaries, pure white elevations, and soft ambient light cones.

### Hierarchy Layers
- **Floor (Canvas):** `#F8FAFC`, flat, zero elevation.
- **Tier 1 (Surface Cards & Quiz Shell):** Solid `#FFFFFF` background, wrapped in a 1px border of `#E2E8F0`. Shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)`.
- **Tier 2 (Interactive Cards / Option Hover):** Elevated during user hover or focus states. Border transitions to `#CBD5E1`. Shadow: `0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`.
- **Tier 3 (Modals, Question Overviews, Drawer Popups):** `#FFFFFF` fill with border `#E2E8F0`. Shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)`.
- **Selected State Elevation:** When an option is active or selected, elevation is neutralized in favor of a 2px interior border tint (`#4F46E5`) with an ambient background tint (`#EEF2FF`).

## Shapes

The design system maintains a unified roundedness profile (`roundedness: 2`), applying `1.5rem` (`rounded-xl` in this scale) to prominent content cards, quiz containers, and evaluation score cards to create an inviting, humanized workspace.

### Corner Radius Guidelines
- **Primary Content Cards & Quiz Containers:** `1.5rem` (`rounded-xl`).
- **Interactive Option Blocks & Modal Shells:** `1rem` (`rounded-lg`).
- **Buttons, Form Inputs, Badges, and Score Displays:** `0.5rem` (`rounded`).
- **Status Pills, Circular Audio Triggers, and Score Rings:** Full pill/circular radius (`9999px`).
- **Dividers and Stroke Rules:** Rounded stroke caps for score progress tracks and linear indicator lines.

## Components

### 1. Header (Dark Slate Anchor)
- **Background:** `#0F172A` with a subtle bottom line `#1E293B`.
- **Contents:** Platform brand label, current HSK level tag, interactive progress bar, countdown timer, and utility buttons (Quit, Flag Question).
- **Text:** Crisp white `#FFFFFF` for primary titles, `#94A3B8` for secondary trackers.

### 2. Interactive Quiz Option Cards
- **Base State:** Background `#FFFFFF`, 1.5px border `#E2E8F0`, corner radius `1rem`. Internal padding `1.25rem`. Typography `body-md` in `#334155`. Left-aligned option letter badge (A, B, C, D) in a rounded `#F1F5F9` square.
- **Hover State:** Border `#4F46E5` (50% alpha), background `#F8FAFC`.
- **Selected State:** Border `#4F46E5` (2px solid), background `#EEF2FF`. Letter badge becomes `#4F46E5` with `#FFFFFF` text.
- **Correct State:** Border `#10B981` (2px solid), background `#ECFDF5`. Letter badge `#10B981` with `#FFFFFF` checkmark.
- **Incorrect State:** Border `#F43F5E` (2px solid), background `#FFF1F2`. Letter badge `#F43F5E` with `#FFFFFF` cross.

### 3. Circular Score Ring & Metrics
- **SVG Ring:** Diameter `160px` with a stroke width of `12px`.
- **Background Track:** `#E2E8F0` with rounded ends.
- **Fill Track:** Gradient or solid `#10B981` for passing scores (≥ 60%), `#F59E0B` for borderline scores, `#F43F5E` for failure.
- **Interior Stat:** Tabular bold numeric percentage (`headline-xl`) paired with a `label-md` badge indicating "Đạt" (Passed) or "Cần ôn tập" (Needs Review).

### 4. Countdown Timer Widget
- **Styling:** Compact rounded badge (`0.5rem`) with tabular monospace font rendering (`label-lg`).
- **Normal State (> 2 minutes):** Slate background `#F1F5F9`, text `#334155`, clock icon in `#64748B`.
- **Urgent State (≤ 2 minutes):** Amber tint background `#FEF3C7`, text `#B45309`, flashing pulse animation every 2 seconds.
- **Critical State (≤ 30 seconds):** Rose background `#FFE4E6`, text `#E11D48`.

### 5. Buttons
- **Primary (Next, Submit):** Background `#4F46E5`, hover `#4338CA`, active `#3730A3`, text `#FFFFFF`, radius `0.5rem`, padding `0.75rem 1.5rem`.
- **Secondary (Previous, Review):** Background `#FFFFFF`, border 1px solid `#CBD5E1`, text `#334155`, hover background `#F8FAFC`.
- **Critical (Clear, Quit):** Background transparent, text `#F43F5E`, hover background `#FFF1F2`.

### 6. Badges & Tags
- **HSK Level Badges:** Pill-shaped, padding `0.25rem 0.75rem`, `label-sm`. Indigo-tinted (`#EEF2FF` background, `#4338CA` text).
- **Tone Markers:** Micro-pill badges accompanying vocabulary tokens indicating Mandarin tone values (e.g., "Thanh 1", "Thanh 4").

### 7. Audio Prompt Player
- **Structure:** Encapsulated rounded card (`1rem`) containing a circular play/pause button (`#4F46E5` fill), an active audio scrubbing wave form in `#CBD5E1` (progressed in `#4F46E5`), and a speed toggle pill (`0.75x`, `1.0x`, `1.25x`) for pronunciation analysis.