# Diwali Sky: Design System

Built with [Hallmark](https://github.com/nutlope/hallmark) as a full redesign in its **Kiln**
theme (atmospheric genre). This file is the locked system: later changes follow it.

**The idea.** The sky is the page. One photograph (an Indian rooftop at dusk, extended upward with
its own sky) fills the screen, visitors' named lanterns rise and recede into it, and every word
sits on the centre axis at the poster's calm foot. There are no cards, no glass and no glow.
Ember is the only accent, and it is used only as a fill.

## 1. Colour

All colours are tokens in `web/tokens.css` (Kiln) and the page block at the top of
`web/style.css`. No colour literal appears outside them.

| Token | Value | Use |
|---|---|---|
| `--color-sky` | `oklch(18% 0.06 268)` | Page background: the photographed sky's zenith, continued past the image |
| `--color-paper` / `-2` / `-3` | `oklch(13% / 17.5% / 22% …40)` | Scrim base, input well, share dialog |
| `--color-ink` | `oklch(94% 0.02 80)` | Cream: the title, headings, primary text |
| `--color-ink-2` | `oklch(84% 0.025 70)` | Byline, lead text, labels |
| `--color-muted` | `oklch(72% 0.03 60)` | Captions, placeholders, field and ghost-button edges |
| `--color-accent` | `oklch(70% 0.2 45)` | Ember: the Launch button fill, your lantern's tag ring |
| `--color-accent-ink` | `oklch(14% 0.02 40)` | Text on ember |
| `--color-focus` | `oklch(76% 0.19 56)` | Focus ring, instant |
| `--color-tag` / `--color-tag-ink` | warm paper / brown | The paper tag on each lantern (part of the photographed object) |
| `--canvas-*` | hex twins | The same ink and ember colours for the canvas (title, sparks) |

Rules: every letter stays cream, and ember never colours text. There are no gradients except two:
Kiln's paper scrim under the poster's foot, and the top fade into the sky colour. There is no
third hue.

## 2. Type

Two families, self-hosted as Latin-subset WOFF2 files (the security policy allows `'self'` only).

| Role | Face | Size | Where |
|---|---|---|---|
| Title | **Gloock** 400, −0.015em | `clamp(3.25rem, 6.4vw + 1rem, 8.5rem)`, phones `clamp(2.75rem, 13vw, 3.5rem)` | "Happy Diwali", drawn by the spark canvas in solid cream |
| Intro line | Gloock 400 | `--text-display` | "A little spark. A sky of wishes." (during the fuse) |
| Heading | Gloock 400 | `--text-2xl` | Success line, share dialog title |
| Wordmark | Gloock 400 | `--text-lg` (phones `--text-md`) | "A sky full of wishes" |
| Figure | Gloock 400, tabular, −0.03em | `--text-3xl` (phones `--text-2xl`) | The lantern count |
| Lead | **Geist** 400 | `--text-lead` (18–22px) | Byline, success message |
| Body, buttons | Geist 500 | 16px | Launch lantern, Pass on the light |
| Placeholder | Geist 400, faded | 16px | "Your name", inside the field |
| Caption | Geist 400 / 500 | 14px, sentence case, no tracking | The privacy note, "lanterns in our sky" |
| Lantern tag | Geist 500 | 11–13px, scales with distance | Names on the lanterns |

Kiln names Boska for display. Fontshare is blocked by this environment's network policy, so
Gloock, the closest high-contrast serif on Hallmark's list, stands in. This is recorded in the CSS stamp.

There are no eyebrows, no tracked capitals and no italic or accented words in headings.

## 3. Space, shape, controls

- Hallmark's 4-pt scale only: `--space-2xs` 4 · `xs` 8 · `sm` 12 · `md` 16 · `lg` 24 · `xl` 40 · `2xl` 64.
- Container: 1440px cap with a 64px gutter (24px under 60rem, 16px under 40rem). At 1920 the
  gutters grow and the measure doesn't.
- Controls are pills, 50px tall (44px for small ones). The **ember pill** (`.btn-primary`) is the single
  primary action. The **ghost pill** (`.btn-ghost`) has a 1px inset ring in `--color-muted` and is used
  for every other button. Icon buttons are 44px ghost circles.
- Each control has all eight states: default, hover, focus-visible (instant ring), active, disabled
  (fill, ink, `cursor: not-allowed` and the attribute), loading ("Launching…"), error (inline
  `#form-status`) and success (the form becomes the success line).
- The input is a smoked well: `--color-paper-2` with a 1px `--color-muted` edge, 16px radius and a
  constant border. "Your name" sits inside it as the placeholder, in Geist and faded
  (`--color-placeholder`, muted at 72%). A visually hidden `<label>` keeps the name for screen readers.
- The share dialog is the only surface: `--color-paper-2`, 28px radius, a 1px rule and no shadow.

## 4. Layout: a centred Poster

1. **Top bar**, edge-aligned: the wordmark on the left; Skip intro, Replay and Sound on the right.
2. **Open sky**: everything above the poster's foot belongs to the lanterns.
3. **The poster's foot**, centred on one axis and lifted off the bottom edge by `--lift` (18svh on
   desktop, 14svh under 60rem, 12svh on phones): title → byline → name field with the Launch
   lantern button → privacy note → a row with the count and "Pass on the light". The block rests a
   little above the screen's middle, which also puts the burst in open sky above the rooftops. The
   title is capped at 15svh, so short laptop screens stay balanced.
   The byline, form and footer hold their space through the intro, so the title's position never
   changes.
4. A paper scrim at 72% rises behind the foot so the words sit on the dark side of the photograph.
   It darkens only the photograph: lanterns sit above it, at full brightness.

Landscape phones hide the privacy note and tighten the gaps. With the keyboard open on a phone, the form
moves into the visible space on a smoked well, and everything else steps aside.

## 5. Scene and motion

- `resources/images/rooftop-sky.webp` is the original photo extended upward with its own sky
  (`scripts/extend-sky.py`).
- **The intro, one shot:**
  1. The fuse burns for 3s.
  2. The shell lifts off and the camera tilts up with it. Both take 3.2s (`--dur-camera` in CSS,
     `FLIGHT` in `app.js`), so the camera follows the shell into the sky rather than starting late.
  3. The shell decelerates toward its apex, which is the exact centre of the "Happy Diwali" box, and
     bursts there in a ring of ember sparks.
  4. The sparks gather into the letters in place: the title never travels. Once it has formed, the
     byline, the form and the footer fade in 250ms apart, with opacity only and nothing sliding.
- **Lanterns** (engine in `web/app.js`):
  - The sky starts empty and lanterns are released one at a time from the roof edges of the houses
    across the street: anywhere along the skyline, the paper tag resting on a roof line between the
    tallest roofs and the parapet's lights.
  - Each one lights up over 4.5s, lifts clear of the houses (16 to 26% of the screen height,
    easing out over about 14s) and recedes toward a vanishing point just past the top edge, with a
    slight drift of its own.
  - Lanterns are never dimmed behind the words; they keep their full light the whole way. They slip
    away only at the far end, fading out once they are about half their size.
  - No two lanterns ever overlap, including one that is fading out, and no name appears twice at once.
  - At most 16 on desktop, 12 on tablet, 7 on phone.
  - Your lantern launches from the centre of the screen, above the interface, with an ember ring
    on its tag.
- Lanterns are photographs: no glow halos, no flicker, no stars. "Nothing pulses, flickers or glows" (Kiln).
- **The title** forms once from ember sparks at the burst point, then rests in solid cream. A
  ResizeObserver keeps it on its box when the foot changes height (for example, form to success).
- Only `transform` and `opacity` animate. `prefers-reduced-motion` skips the intro, places the
  lanterns still and removes every transition.
- Without JavaScript the title is real text, and nothing is hidden behind a script (`.no-js` / `.js`).

## 6. Resources

```
resources/
  images/  rooftop-sky.webp (scene), lantern.webp, rocket.webp, diwali-share.jpg (OG image), kid.webp (unused)
  fonts/   gloock.woff2, geist.woff2 + OFL licences
           outfit, manrope, playfair-display (no longer shipped; left for the owner to remove)
  audio/   diwali-instrumental.mp3
  icons/   Lucide SVGs + licence, inlined at build time
  source/  terrace-original.png, terrace.webp
web/
  tokens.css, base.css  Hallmark scaffold (Kiln), inlined after the stamp by scripts/build.mjs
  style.css             the stamp, the waivers on record, then the page
```

## 7. Checks

- Hallmark `sloplint`, static tier on the built page: **clean** (0 FAIL, 0 REFLEX, 0 WARN).
- Render tier against the served page (`--url http://localhost:3000/`): **0 FAIL, 0 REFLEX**. The one
  note (77, "one section") is dismissed on record: this is one screen by design.
- Before the redesign: 38 FAIL, 8 REFLEX. The `--kept` check confirms every link, field and script
  hook is kept. Changed and dropped words are listed in the stamp at the top of `web/style.css`.
- Rendering `public/index.html` straight from disk reports the root-absolute `/resources/...` files as
  missing. That's a property of reading from disk, not of the site.
- Own checks from fresh browser windows at 1440, 1920, phone and landscape: no horizontal scroll, no
  lantern overlaps, no page errors. API and Vercel tests pass.
- `.hallmark/compare.html` (local only) shows the before and after side by side.
