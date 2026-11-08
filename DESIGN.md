# Diwali Sky design system

Guidance: UI/UX Pro Max, https://github.com/nextlevelbuilder/ui-ux-pro-max-skill. Its generated recommendation supplied geometric sans typography, vibrant rose/blue direction and bottom CTA hierarchy. The generic light hero/features template is intentionally adapted to this user's immersive night-sky greeting; no unrelated feature sections are added.

## Palette and typography
- Midnight indigo (#10112D / #1B1B47) creates depth and a consistent background for sparkles.
- Magenta (#F08BD2) marks the primary Launch action and the celebratory lettering.
- Pale lilac (#F7F0FF / #C7C9E3) keeps normal and secondary text readable. The secondary share action uses a subdued indigo surface and a lilac outline.
- The terrace flames and red lanterns retain their natural colours; they are scene objects, not additional UI accents.
- Outfit 800 is used for the large greeting: rounded geometric forms make it expressive without decorative-script legibility problems.
- Work Sans 400–600 is used for labels, inputs and buttons, where small-size clarity matters most. Both variable fonts are served by the Site.
- Contrast checks: Launch text/fill 7.55:1; primary text/input 15.19:1; secondary text/sky 9.96:1.

## Proportion and behaviour
- Type roles: 12px helper, 14px label, 16px input/button/body, 18–20px section heading, fitted responsive display lettering.
- Spacing: 4/8/12/16/24/32px. Touch targets: 48px; Lucide icons: 20px with 2px strokes. Corners: 12px controls inside a 16px input group.
- Canvas bitmap dimensions use device pixels; its display width and height are explicitly 100% in CSS. Word fitting and rocket coordinates use logical CSS pixels.
- Rocket: three-second burning fuse; vertical flight; single continuous camera zoom. Sparkle streaks and cross-shaped glints replace the dotted LED grid.
- Reveal order: sparkles form Happy Diwali, then Wishing you above and by Hardik below, then the launch form. The share action is a separate bottom button, clear of the viewport edge.
- Lanterns appear within the sky and recede along Z rather than travelling out of the top. Existing names are shared through D1; removed records are removed from open clients on refresh.
- Reduced-motion mode, visible field label, inline feedback, focus rings and safe-area clearance are retained.

## Verification
- Visual QA uses 375×667 and 390×844 CSS-pixel embedded viewports, which independently run the real responsive page.
- The QA wrapper is local development code and is not a published Site route. Production anti-framing policy remains unchanged.

## Glass and launch confirmation
- Controls, input group, form panel and share action use a consistent translucent gradient, light upper edge, background blur and inset highlight. Primary Launch retains a stronger pink tint to preserve hierarchy.
- Success replaces the form with a personalised glass card, lantern artwork, a brief highlight sweep and sparkle burst; errors remain inline and replay restores the form.
- Final framing keeps the wall and neighbouring rooftops at the lower edge, with most of the viewport devoted to the sky. The camera no longer fades the whole architectural layer away.
- Mobile success and input states were visually checked at 375×667 CSS pixels.

## Share options
- Pass on the light opens the system share sheet where supported. Unsupported or denied native sharing opens a glass dialog with WhatsApp, Telegram, Email and Copy link.
- Cancelling native sharing does not copy anything. Copying is an explicit option with inline confirmation.
- The dialog has a labelled heading, native modal focus handling, Escape/close/backdrop dismissal and consistent Lucide controls. Mobile fallback and copy feedback were checked at 375×667 CSS pixels.

## Keyboard and frost refinement
- Focus on the name field immediately hides and disables the bottom share control on mobile; it never moves above the keyboard. It returns after focus/keyboard dismissal.
- VisualViewport resize and scroll events track the space above the keyboard. In the compact typing state, the form is centred within that visible space and the large greeting/controls are visually suppressed to prevent overlap. Submitting blurs the field before showing the success card.
- Glass surfaces now use 44–48px background blur, a denser translucent tint and consistent inset edge lighting. Input focus highlights its containing field instead of drawing a separate large outline over adjacent controls.
- Squircle corners use native CSS corner-shape with rounded-corner fallback; backdrop blur is retained without clip masks.
- QA includes a 375×430 viewport to simulate available keyboard-height space; this is a layout check, not a physical Android keyboard test.

## Social preview
- Open Graph and large-image Twitter metadata reference a public 1200×630 JPEG preview with explicit MIME type, dimensions and alt text. It is a site asset so external chat preview fetchers can access it without signing in.
- The promotional artwork follows the same pink/indigo palette, lanterns and Indian rooftop setting.

Sharing preview follow-up: verified live HTML and JPEG return HTTP 200 with WhatsApp/Facebook crawler user agents. Added a fresh `/diwali` sharing route, canonical/OG URL and image URL to avoid the previously shared URL's cached card. Native share, app share links and copying use that route. Explicit robots permission and correct image HEAD/content length are supported. Local worker checks cover crawler metadata, JPEG bytes, HEAD and robots; actual messaging-app card generation remains outside site control.

## Shared lantern count
A compact frosted squircle below the existing share button displays the API's complete database total, with Indian number grouping and singular/plural labels. It counts lantern releases rather than online presence. The button and existing greeting/form positions are unchanged. The badge shares the button's keyboard hiding and intro visibility, refreshes with the existing 15-second sky polling and after a release, and stays hidden during unavailable/invalid responses rather than showing a fabricated zero. Short desktop viewports place the badge beside the button to avoid the bottom edge.

## Laptop layout and full-sky lantern paths
The laptop screenshot exposed a fixed-position collision between form, share action and counter. The page now uses a two-column grid at 1000px+: a left-aligned two-line greeting and a right action stack. Content height governs Launch, Share and the counter; they cannot overlap. Smaller screens use a single content stack, with a compact 375×667 layout that fits all controls and allows scrolling when necessary. Outfit/Work Sans and the existing indigo/pink palette remain.

The launch panel uses a diffuse 48px backdrop, a denser indigo tint, restrained upper-edge reflection and squircle corners. Share avoids an opacity-animated ancestor so its backdrop can sample the scenery. Keyboard hiding and centred typing behaviour remain.

Lanterns use a stratified 28-cell sky distribution with independent seeded paths toward left, right and top edges. Screen-space travel avoids the previous central vanishing-point cluster. Desktop shows up to 28; phones show up to 14 smaller lanterns. The greeting area softly dims scenery behind the text. Reduced motion uses static distributed positions. Existing records and API schema are unchanged; preview-only names are confined to the development server.

Validation: API tests passed. Visual checks at 1363×936 and embedded 375×667; measured phone control bottom 638px in a 667px viewport with no scrolling or overlap. Desktop exit distribution: 10 left, 9 right, 9 top in a 28-lantern fixture.
