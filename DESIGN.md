# Diwali Sky — Design System

A single immersive greeting: a rocket is lit on an Indian rooftop, the camera tilts up into the
night sky, "Happy Diwali" forms out of sparks, and visitors' lanterns rise and drift away. The
interface is deliberately small: one greeting, one action card, one footer. Everything else is sky.

Process reference: [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill).
Its recommendations for this brief ("festive, immersive, premium") were adopted where they fit:
a serif heading paired with a clean sans body ("Classic Elegant" pairing), SVG icons instead of
emoji, slow motion ("avoid fast animations"), visible focus states, reduced-motion support, and
checks at 375 / 768 / 1024 / 1440 px. Its default suggestion of liquid glass was **not** used:
the panels are solid surfaces so text never depends on what is behind it.

---

## 1. Colour

The palette is unchanged from the original site: midnight indigo, magenta and lilac.

| Token | Value | Use |
|---|---|---|
| `--night-0` | `#091028` | Page background; the exact zenith colour of the extended sky photo |
| `--night-1` | `#10112D` | Input fields, dialog background |
| `--night-2` | `#1B1B47` | Share options |
| `--night-3` | `#2A2B5C` | Hover state for dark controls |
| `--surface` | `rgba(16,17,45,.94)` | Card, footer pill, icon buttons (solid, no blur) |
| `--magenta` | `#F08BD2` | Primary action, eyebrows, focus ring |
| `--magenta-strong` | `#FFAEE6` | Primary hover |
| `--on-magenta` | `#30102C` | Text on the primary button |
| `--lilac-0` | `#F7F0FF` | Primary text |
| `--lilac-1` | `#C7C9E3` | Secondary text (body copy, byline) |
| `--lilac-2` | `#9FA2C8` | Tertiary text (captions, placeholders) |
| `--line` / `--line-strong` | lilac at 12% / 25% | Hairline borders |
| `--danger` | `#FFB4C8` | Inline form errors |

Contrast on `--surface`: lilac-0 ≈ 16:1, lilac-1 ≈ 10:1, lilac-2 ≈ 6.5:1, on-magenta on magenta ≈ 7.5:1.
The scene (rooftop flames, red lanterns) keeps its photographic colours; they are not UI accents.

## 2. Typography

Three families, each with one job. All are self-hosted as Latin-subset WOFF2 files (the
Content-Security-Policy allows `'self'` only). Names in Devanagari and other scripts fall back to
the system font.

| Role | Family | Weight | Size (desktop / phone) | Where |
|---|---|---|---|---|
| Display | **Outfit** | 800 | fitted to the title box | "Happy Diwali" spark lettering (canvas) |
| Heading | **Playfair Display** | 500–600 | intro 32–56px · card 26/32 · phone 21/26 | Intro line, card titles, dialog title |
| Byline | **Playfair Display Italic** | 400 | 20/28 · phone 17/24 | "with love, Hardik" |
| Eyebrow | **Manrope** | 700, uppercase, +0.22em | 12/16 · phone 11 | "Wishing you", "A light from …", "Share" |
| Body | **Manrope** | 400 | 15/24 · phone 14/21 | Card descriptions |
| Label | **Manrope** | 600 | 13/18 | Form label |
| Input | **Manrope** | 500 | 16 (prevents iOS zoom) | Name field |
| Button | **Manrope** | 700 | 15 primary · 14 secondary · 13 ghost | Launch, Share, Skip |
| Caption | **Manrope** | 400 | 12/18 | Privacy note, copy feedback |
| Counter | **Outfit** 700 + Manrope 500 | — | 18 + 12 | "55 lanterns in our sky" |
| Lantern name | **Manrope** | 700 | 10–13, scales with the lantern | Paper tag on each lantern |

Rule of thumb: Outfit appears only where a number or the hero needs weight; Playfair is for
headings and the byline; everything you interact with is Manrope.

## 3. Spacing, shape and controls

- 4-pt spacing scale: `4 · 8 · 12 · 16 · 20 · 24 · 32 · 40 · 48 · 64`.
- Page gutter: `clamp(16px, 4vw, 40px)` plus safe-area insets.
- Radii: 10 (small), 14 (controls), 20 (card, dialog).
- Controls: primary/input height 52px (48px on phones); icon buttons and secondary buttons 44px.
- Icons: Lucide, 18px, 2px stroke, inlined at build time.
- Card: width 460px (full width on phones), padding 32px (24px on short screens, 20px on phones),
  1px hairline border, a 1px magenta highlight along the top edge, layered drop shadow.

## 4. Layout

The page has four fixed regions, top to bottom:

1. **Top bar**: brand line on the left ("A sky full of wishes", hidden on phones); Skip / Replay / Sound on the right.
2. **Greeting**: eyebrow → display title → byline, centred.
3. **Open sky**: a flexible gap where lanterns are born and travel. Nothing in the interface sits here.
4. **Action**: the launch card, centred and anchored to the bottom, then the **footer**: lantern
   counter + "Pass on the light". On screens ≥ 1024px the footer items sit in the bottom-left and
   bottom-right corners; below that they form a row under the card.

Special cases: landscape phones (height ≤ 500px) put the greeting on the left and the card on the
right. On phones with the keyboard open, the card centres itself in the visible viewport and the
greeting, top bar and footer step aside.

## 5. The sky

- `resources/images/rooftop-sky.webp` is the original rooftop photograph extended upward by
  1,024px of its own sky (see `scripts/extend-sky.py`). Each column continues the photo's top
  colour, eases to the zenith navy `#091028`, and carries the same grain, so there is no visible
  seam and no synthetic gradient.
- The scene is sized from `--roof = max(100svh, 90vw)`: the full photo covers the viewport during
  the intro. On wide screens the 90vw width also crops the side building out of frame.
- After the rocket launches, the camera tilts up over 4.6s until only the lit parapet remains at
  94% of the viewport height. The sky is the photo itself; the only overlay is a top fade into the
  same `#091028`, so the edge of the image is never visible on very tall screens.
- Faint twinkling stars appear only in the upper half, after the greeting forms.

## 6. Lantern motion

Lanterns are drawn by a small engine in `web/app.js`, not by CSS keyframes.

- **Empty start.** The sky is empty when the greeting forms. Lanterns are then born one at a
  time, about every 2–3.5s, until the sky holds 16 (desktop), 12 (tablet) or 7 (phone). After
  that a new one is born whenever one leaves.
- **Born in the sky.** Birth points are anywhere across the full width, above the rooftop
  skyline, below the top bar, and never behind the greeting, card or footer. A lantern fades and
  ignites over 4.5s; its glow flickers continuously.
- **Perspective, not paths.** Each lantern recedes in depth toward a vanishing point at
  (centre, −0.8 × viewport height), above and outside the screen. Its screen position is
  `VP + (birth − VP) / depth`, so it rises, drifts toward the centre and shrinks together, like
  the lower part of a "V" whose point we never see. Depth accelerates gently from rest, so
  nothing ever starts fast. Typical speed is 7–12px per second, and a crossing takes about 1–2
  minutes.
- **No overlaps.** Before a lantern is born, its whole remaining flight is checked against every
  lantern already in the sky, sampled every 1.5s. Any candidate that would touch another, label
  included, is rejected. Among the valid candidates, the one farthest from its neighbours wins.
- **No repeated names.** A name (case-insensitive) is never in the sky twice at once. Records
  rotate, and new wishes from the 15s refresh are first in line.
- **Readable greeting.** A lantern passing behind the greeting dims smoothly, by up to 62%, in
  proportion to how much it overlaps.
- **Your lantern.** After you press Launch, your lantern is born at the centre of the screen
  *above* all interface layers. It is larger, tagged in magenta, and slower. Its vanishing point
  is straight above it, so it rises vertically and recedes. Any lantern whose path would cross it
  fades out gracefully.
- **Reduced motion.** The intro is skipped and lanterns are placed statically, without overlaps.

## 7. Resources

All shipped and source assets live in `resources/`. The build inlines them into the Sites
worker and copies them into `public/` for Vercel at the same URL paths.

```
resources/
  images/   rooftop-sky.webp (scene), lantern.webp, rocket.webp, diwali-share.jpg (OG image), kid.webp (unused)
  fonts/    outfit.woff2, manrope.woff2, playfair-display(-italic).woff2 + OFL licences
  audio/    diwali-instrumental.mp3
  icons/    Lucide SVGs + licence (inlined into the HTML at build time)
  source/   terrace-original.png (master photo), terrace.webp (previous crop)
```

`/assets/diwali-share.jpg` and `/assets/diwali-preview-2026.jpg` remain as aliases so existing
social previews keep working.

## 8. Verification checklist

- Phone 390×664, tablet 820×1180, desktop 1440×900, laptop 1366×768: no interface overlaps, no
  horizontal scroll, lanterns never overlapping or duplicated (measured in the preview).
- Keyboard: visible magenta focus ring on every control; the dialog uses native modal focus handling.
- `prefers-reduced-motion` respected; sound is opt-in.
- The database, API and lantern records are unchanged by this design.
