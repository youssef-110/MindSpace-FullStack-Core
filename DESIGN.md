# MindSpace design system

**Twilight editorial.** A quiet, achromatic page with one blue for actions, a retro serif for the
big statements, and the dusk sky as the single atmospheric moment. The name is literal: the sky is
the "space", the page beneath it is where you think.

Reference: the *Portal* style on styles.refero.design (twilight serif editorial), adapted for a
product people use for a long time: a night theme, status tones for results, and reading-length text.

## The five things that must survive

1. **The dusk sky** (`<Sky>`): sky blue through violet and mauve to warm coral, with hills on the horizon. It is the only large coloured surface. At most one per page.
2. **Serif for display only.** Fraunces 400 on `h1`/`h2` and `.display`, never below 28 px, never bold, never for buttons, labels or body. Everything else is Inter.
3. **One accent.** Blue (`brand`) is for actions, links, focus, selection and progress. Never a decorative fill, never a section background.
4. **Pills and soft corners.** Every button is a full pill. Cards are 22 px, large feature surfaces and images 30 px. Nothing interactive is sharper than 12 px.
5. **Halos, not shadows.** Depth is a 1 px line plus a 5 px soft ring (`.card`). No drop shadows except the gentle lift on `.card-hover`.

## Colour

CSS variables in `src/index.css`, exposed to Tailwind as `bg-paper`, `text-ink-2`, `border-line`, etc.

| Token | Light | Night | Use |
|---|---|---|---|
| `paper` | `#f7f7f7` | `#0b0b0f` | Page canvas |
| `surface` | `#ffffff` | `#15151b` | Cards, inputs, nav capsule |
| `sunken` | `#f0f0f2` | `#0f0f14` | Wells, tracks, tags, hover fills |
| `ink` | `#000000` | `#f5f5f7` | Headings, strong text, dark buttons |
| `ink-2` | `#3e3e3e` | `#c9c9d1` | Body text (the `body` default) |
| `ink-3` | `#636363` | `#9a9aa6` | Muted text, metadata, captions |
| `line` | `#e7e7ea` | `#26262e` | Hairlines and card borders |
| `brand` | `#007aff` | `#3d9bff` | Rings, icons, focus, progress, selection |
| `brand-fill` | `#0070eb` | `#3d9bff` | Filled buttons only (text is `brand-ink`) |
| `brand-text` | `#0064d2` | `#6cb2ff` | Links and small blue text |
| `brand-soft` | `#e8f2ff` | `#10243d` | Selected rows, active tab, blue tags |
| `sage` / `amber` / `rose` (+ `-soft`) | | | **Result tones only**: good / caution / alert. Not decoration. |

Text on the sky is always white (`.sky` sets it). Never put dark text on the gradient, and never
put body-size text over the warm lower third: keep copy in the upper two thirds.

## Type

- **Display:** Fraunces Variable, weight 400, line-height 1.0 to 1.05, tracking −0.02em. Sizes 28 to 72 px. Sentence case.
- **UI and body:** Inter Variable 400 / 500 / 600 only (never 700+), tracking −0.014em. Body 16 px / 1.5. `.lead` 18 px. Long reading uses `.prose-lesson` (17 px / 1.65, 66ch).
- Small headings (`h3`, `h4`, card titles) are Inter 600. `.eyebrow` is 13 px Inter 600 in `ink-3`, sentence case. **No all-caps labels, no letter-spaced caps.**
- Numbers that change or line up use `.num` (tabular).
- No decorative italic or coloured word inside a headline.

## Space and shape

- Page width 1200 px (`.container-page`), reading width 680 px (`.reading`).
- Sections: `.section` (72 px mobile, 104 px desktop). Card padding 20 to 32 px. Gaps 12 to 24 px.
- Radii: `rounded-[var(--r-sm)]` 12, `--r-md` 16, `--r-lg` 22 (cards), `--r-xl` 30 (hero panels, feature blocks). Pills `rounded-full`.
- Touch targets ≥ 44 px. Buttons are 48 px (`.btn-sm` 40, `.btn-lg` 56).

## Kit

CSS classes (`src/index.css`):
`.card` (white, line, halo) · `.card-flat` · `.card-hover` (lift on hover) · `.well` · `.glass` ·
`.btn` + `.btn-primary` (blue) / `.btn-dark` (ink) / `.btn-ghost` (outline) / `.btn-soft` (grey) / `.btn-sky` + `.btn-sky-ghost` (on the sky only) + `.btn-sm` / `.btn-lg` ·
`.tag` + `.tag-brand` / `.tag-good` / `.tag-warn` / `.tag-alert` · `.link` · `.field` + `.input` ·
`.eyebrow` · `.lead` · `.display` · `.num` · `.container-page` · `.section` · `.reading` · `.prose-lesson` · `.skeleton` · `.animate-float`

Components (`src/components/ui.jsx`):
`LogoMark` · `Wordmark` · `Icon` (see the `ICONS` map for names) · `Reveal` · `Stagger` + `StaggerItem` · `CountUp` ·
`Sky` · `PageHeader` · `BackLink` · `Ring` · `Meter` · `Sparkline` · `TONE` · `CrisisCallout` · `EASE`

Use the kit before writing anything new. If a pattern is needed on more than one page, it belongs in the kit.

## Layout

- The nav is a floating glass capsule (`App.jsx`), fixed at the top; on phones a second capsule of five tabs floats at the bottom.
- Every page except Home is rendered inside `main.container-page` with top padding that already clears the nav. **Pages must not add their own outer container or top padding.** Start with `<PageHeader>` (or `<BackLink>` then a header).
- Home is full-bleed and owns its own containers; its hero is a rounded `Sky` panel inset from the viewport edge with the nav floating over it.
- Mobile first. Check 375 px: no horizontal scroll, the bottom tab capsule (about 80 px) must never cover a primary action.
- Marketing sections are editorial: one idea per section, generous gaps. Avoid rows of three identical icon cards; vary the composition (split, list, bento, big number).

## Motion

- Ease `EASE` = `cubic-bezier(0.22, 1, 0.36, 1)`. Entrances 500 to 800 ms, feedback 150 to 250 ms. Springs for things that follow the finger (`stiffness 420, damping 36`).
- Scroll: `Reveal` / `Stagger` once per element. Data draws itself in: `Ring`, `Meter`, `Sparkline`, `CountUp`.
- Shared-element feel: the active nav pill and tab pill slide (`layoutId`). Use `layoutId` for selected states in lists and segmented controls.
- Buttons press to 0.97. Cards lift 3 px on hover (`.card-hover`).
- Animate only `transform` and `opacity` (plus SVG stroke). No layout-thrashing animations, no parallax on text.
- `prefers-reduced-motion`: CSS collapses durations and `MotionConfig reducedMotion="user"` is set at the root. Nothing may depend on an animation finishing to be usable.

## Voice

Plain, warm, exact. Say what a score means and what it cannot tell you. No hype, no exclamation
marks, no em dashes in UI copy. Never imply diagnosis.

## Logo

`brand/mindspace-mark.svg`, `public/favicon.svg`, `LogoMark` in the kit. A dusk-gradient disc
holding two white hills that read as a lower-case "m", under one evening star. The wordmark is
"MindSpace" in Inter 600, tracking −0.03em.
