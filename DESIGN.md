# MindSpace design system

The visual world is the psychology lab's paperwork: a Rubin's-vase card from a perception study, and
the answer sheet printed in green "drop-out" ink. Graphite ink on cool paper, one deep green for
actions, and a pencil-yellow mark for the one thing you're asked to find.

## Logo

`brand/mindspace-mark.svg` (presentation: `brand/mindspace-logo.png`). Rubin's vase: two facing
profiles whose shared negative space is a vase, so the mark is literally the space between minds. It
reads at 16 px, works in one colour, and the favicon (`public/favicon.svg`) switches with the
browser's light or dark theme. In the app it is `LogoMark` in `src/components/ui.jsx`.

## Colour

Tokens are CSS variables on `:root` / `html.dark` in `src/index.css`, exposed to Tailwind as `bg-paper`, `text-ink`, etc.

| Token | Light | Dark | Use |
|---|---|---|---|
| `paper` | `#f4f5f1` | `#0f1513` | Page background (cool grey-green, not cream) |
| `surface` | `#ffffff` | `#161e1a` | Panels, answer tiles |
| `sunken` | `#eceee9` | `#0b100e` | Wells: matrix grid, meters, tags |
| `ink` | `#15211c` | `#e9eeea` | Text and the logo |
| `ink-2` | `#4c5853` | `#a3afa9` | Secondary text |
| `line` | `#d9ded8` | `#26302b` | Borders, rules |
| `brand` | `#1f5e4b` | `#7cc2a3` | Primary actions, progress, selection |
| `marigold` | `#d4952b` | `#e2a94b` | The "find this" mark: the blank puzzle cell. Never body text. |
| `sage` / `amber` / `rose` | `#2e7d5b` / `#8a5a00` / `#b3473f` | lighter | Result tones |

## Type

- **Display:** Source Serif 4 (variable, optical sizes), weight 600 to 650. An academic-journal voice for a site about published research.
- **Body:** Atkinson Hyperlegible 400/700, 17 px, line-height 1.6. Built for legibility by the Braille Institute.
- Both self-hosted (no Google Fonts requests). Sentence case; no all-caps labels.

## Shape and space

- Radius by hierarchy: `--r-sm` 6 px (cells), `--r-md` 10 px (answers, callouts), `--r-lg` 14 px (panels). Buttons 8 px.
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
