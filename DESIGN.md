# MindSpace design system

One idea runs through the brand: **the missing piece**. A 3×3 matrix with one empty cell is
both the logo and the reasoning test, and it stands for what the site does: find the piece
of yourself a test can measure, and be honest about the pieces it can't.

## Logo

Three directions live in `brand/`. **A is in use** (`public/favicon.svg`, `LogoMark` in `src/components/ui.jsx`).

| File | Idea | Why |
|---|---|---|
| `logo-a-missing-piece.svg` | 3×3 grid, last cell is a marigold dot | Ties the brand to the matrix test; reads clearly at 16 px; works in one colour. |
| `logo-b-bell.svg` | A bell curve with a marigold point at its peak | About measurement and normal distributions. Friendlier, but the curve reads as "statistics app". |
| `logo-c-open-mind.svg` | Two arcs (hemispheres) open around a dot | The softest and most "wellbeing". The least specific to testing. |

To switch, copy the SVG over `public/favicon.svg` and update `LogoMark`.

## Colour

Tokens are CSS variables on `:root` / `html.dark` in `src/index.css`, exposed to Tailwind as `bg-paper`, `text-ink`, etc.

| Token | Light | Dark | Use |
|---|---|---|---|
| `paper` | `#f4f5fa` | `#10132a` | Page background (cool, not cream) |
| `surface` | `#ffffff` | `#181c38` | Panels, answer tiles |
| `sunken` | `#eceef6` | `#0c0f22` | Wells: matrix grid, meters, tags |
| `ink` | `#171b3a` | `#eceefa` | Text, primary lines (deep indigo, not black) |
| `ink-2` | `#4a5072` | `#a7accb` | Secondary text (≥ 4.5:1 on paper) |
| `line` | `#dcdfec` | `#2a2f52` | Borders, dividers |
| `brand` | `#4b3fc9` | `#9c94ff` | Actions, selection, meters |
| `marigold` | `#f2b54e` | same | The "missing piece": logo dot, blank cell, accents on dark. Never text on light. |
| `sage` / `amber` / `rose` | `#2f7d6a` / `#8a5a00` / `#b4475a` | lighter variants | Result tones: good / caution / alert |

## Type

- **Display:** Bricolage Grotesque 500–800 (headings, big numbers). Tight tracking (−0.02em), line-height 1.08.
- **Body:** Atkinson Hyperlegible 400/700. Designed by the Braille Institute for legibility, which suits a site people read about their own minds on. 17 px base, line-height 1.6, lines under ~66ch.
- Sentence case everywhere. No all-caps labels.

## Shape and space

- Radius by hierarchy: `--r-sm` 8 px (cells, small tiles), `--r-md` 14 px (answers, callouts), `--r-lg` 22 px (panels). Buttons 12 px.
- Spacing on Tailwind's 4 px scale; sections `py-14`, page gutters 16 px.
- Touch targets ≥ 44 px (buttons 48 px, answer rows 52 px, bottom tabs 58 px).

## Components (`src/index.css` + `src/components/`)

`.panel` · `.btn` + `.btn-primary` / `.btn-quiet` · `.tag` · `.link` · `Meter` · `CrisisCallout` · `MatrixGrid` / `MatrixCell` · `Icon` · `LogoMark`

## Motion

- One orchestrated moment: the hero puzzle's cells build in on load.
- Section headings fade up once on scroll; questions slide in when you answer; results fade in.
- Ease `cubic-bezier(0.22, 1, 0.36, 1)`, 200–700 ms.
- `prefers-reduced-motion` turns animation off (CSS rule + `MotionConfig reducedMotion="user"`).

## Layout

- Mobile first. Below `md` (768 px): top bar shows only logo + theme, a fixed 5-tab bar sits at the bottom with safe-area padding.
- Content is left-aligned. Reading pages cap at `max-w-3xl`.
