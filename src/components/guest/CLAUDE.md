# Guest components (`src/components/guest/`)

Loaded in addition to the root CLAUDE.md when working here. Layout: `primitives/` (shared building blocks), `cruise/`, `venue/`, `explore/`, `event/`.

## Primitives (`primitives/`)

- `accordion-item.tsx` — Animated expand/collapse row
- `concierge-prompt.tsx` — Concierge chat prompt card
- `copy-button.tsx` — Inline copy-to-clipboard with check feedback
- `corner-bracket-card.tsx` — Card with decorative corner bracket spans
- `loading-spinner.tsx` — Fixed full-screen loading overlay
- `nav-card.tsx` — Navigation tile card; optional `footer?: ReactNode` renders a third content row below the sublabel (used by venue-dining for category pill + price); `sublabelClassName?: string` for extra classes on the sublabel (e.g. `line-clamp-2`); `hideImage?: boolean` suppresses the image column and adds `pl-4` to the content area
- `page-hero.tsx` — Full-bleed hero image with gradient
- `section-header.tsx` — Numbered section header (e.g. "01 · Title")
- `sticky-header.tsx` — Three sticky nav patterns: `StickyHeader` (always visible, used on Dining/Info/Explore list pages), `ScrollRevealStickyHeader` (fades in on scroll, used on hero detail pages like place-listing and cruise-restaurant-listing), `FloatingBackButton` (glass pill over hero, paired with ScrollRevealStickyHeader). Hooks: `useStickyScroll` (IntersectionObserver, for pages with in-flow headers), `useWindowScroll` (scroll event, for pages with fixed/absolute headers)
- `venue-footer.tsx` — Venue branding footer
- `welcome-envelope.tsx` — Animated envelope reveal
- `welcome-splash.tsx` — Welcome card (delegates to oversized/text variants). Default is `"oversized"` for both hotel and cruise venues — full-bleed image with name card floating over lower half. `"text"` variant uses a shorter in-flow image above the card. Individual venues can override via `venues.splash_variant`.
- `welcome-splash-oversized.tsx`
- `welcome-splash-text.tsx`

Other folders: `cruise/` (cruise venue pages), `venue/` (hotel/resort pages), `explore/` (explore hub: area-listing, explore-collection, place-listing), `event/` (standalone event home). `cruise/cruise-home.tsx` is the design-token reference implementation. Home components (`venue-home`, `cruise-home`) receive their data as props from the server page.

## Accessibility

Guest pages are used on phones by the general public, so these are requirements, not polish:

- **Never disable zoom** (`maximumScale` / `userScalable`) in the viewport.
- **Expandable rows** need `aria-expanded` + `aria-controls`, and collapsed content must be `inert` (`AccordionItem` does this — reuse it).
- **Icon-only buttons** need an `aria-label`; **tab/pill controls** need `aria-pressed` (or `aria-selected`); carousel dots need a label and `aria-current`.
- **Full-screen overlays** (welcome splash/envelope) use `role="dialog"` + `aria-modal` + a label, and autofocus their primary button.
- **Focus and motion:** `globals.css` provides a global `:focus-visible` outline and a `prefers-reduced-motion` override — don't remove outlines (`outline-none`) without a visible replacement. JS-driven animations (rAF, inline transforms) are not covered by the CSS override; skip them when `matchMedia("(prefers-reduced-motion: reduce)")` matches.
- Venue theme colors are user-defined, so don't rely on `--primary` alone for essential contrast (e.g. text on `bg-primary` must use `text-primary-foreground`).

## Dark Mode

All guest-facing venue and event pages (`[slug]/` routes) support system dark mode via `prefers-color-scheme`. The dashboard does not currently implement dark mode.

### Architecture

Dark mode is **CSS-first**: `globals.css` has a `@media (prefers-color-scheme: dark)` block that overrides `:root` token values before any JavaScript runs. This is critical — JS-only approaches (e.g. `useEffect` or `useLayoutEffect`) cause race conditions with component lifecycle that produce inconsistent results, especially on the welcome splash screen.

```css
/* globals.css */
@media (prefers-color-scheme: dark) {
  :root { --background: #1C1A17; --foreground: #EDE8DE; ... }
  body { background-color: #1C1A17; }  /* for iOS status bar */
}
```

`VenueThemeProvider` (`src/components/theme-provider.tsx`) also applies dark overrides as inline CSS vars after mount via `useEffect` for tokens not handled by the CSS cascade (e.g. `--cf-card-shadow`, `--cf-glass-bg`). It also sets `document.body.style.backgroundColor` to ensure the iOS Safari status bar matches the page background.

### Dark palette tokens

The `DARK_MODE` constant in `[slug]/layout.tsx` defines the structural neutral tokens applied to all venue/event pages. **Venue brand colors (`--primary`, `--accent`) are intentionally excluded** — they stay the same in both modes as configured in `venue_themes`.

Key dark values: background `#1C1A17`, card `#252220`, foreground `#EDE8DE`, muted `#2E2B27`, border `#3A3632`.

### Critical constraints

- **Do not add `--background` or `--foreground` to `VenueThemeProvider`'s `lightStyle`**. These must come from the CSS cascade (`:root` in `globals.css`) so the dark media query can take effect on first render before JS fires. Adding them as inline styles would override the CSS and break dark mode on first paint.
- **Do not put `bg-background` on `VenueThemeProvider`'s wrapper div**. The body provides the page background; the wrapper is intentionally transparent so the body color is visible in the iOS status bar area.
- **Splash components (`welcome-splash-oversized.tsx`, `welcome-splash-text.tsx`) use `bg-background`** on their root div — this is correct and intentional. It gives the splash an opaque background that blocks underlying content, and it resolves correctly from the CSS dark media query (not from inline styles).
- **`FloatingBackButton`** uses `var(--cf-glass-bg)` for its background (not a hardcoded color), so it adapts to dark mode.
- **`card-shadow` utility** uses `var(--cf-card-shadow)` which is overridden in dark mode.
- **`theme-color` meta tag** in `src/app/layout.tsx` uses a media-conditional array so Safari's browser chrome matches the dark background.

## Design Token System

All design tokens live in `src/app/globals.css` as `--cf-*` CSS custom properties on `:root`. They are the single source of truth — change a value there and it propagates everywhere. Tokens cover typography, spacing, radius, and interactive states.

**Font families:** `--cf-font-display: "Nunito Sans"` (display/headings, loaded via `--font-serif` CSS variable) and `--cf-font-body: "Source Sans 3"` (body, loaded via `--font-sans`). Use `font-serif` Tailwind class for display text, `font-sans` for body. Both fonts are **per-venue configurable** via `venue_themes.heading_font_family` (→ `--font-serif`) and `venue_themes.font_family` (→ `--font-sans`). Custom fonts are loaded client-side via Google Fonts; Nunito Sans and Source Sans 3 are pre-loaded by Next.js and need no injection. The `FontPicker` dashboard component (`src/components/dashboard/font-picker.tsx`) handles selection and live preview.

**Font weight conventions for display (`font-serif`) text:**
- Hero h1 (`text-hotel-name`, `text-page-title`): `font-semibold` (600)
- Section headings, sticky header venue name, card titles: `font-medium` (500)
- Nav card labels, timeline card titles, decorative/secondary display text: `font-normal` (400)

Tokens are registered in the `@theme inline {}` block so Tailwind generates real utility classes from them:

| Token group | CSS var example | Tailwind utility |
|---|---|---|
| Font size | `--cf-text-hotel-name: 30px` | `text-hotel-name` |
| Font size | `--cf-text-body: 15px` | `text-body` |
| Font size | `--cf-text-label: 11px` | `text-label` |
| Font size | `--cf-text-cta-button: 15px` | `text-cta-button` |
| Font size | `--cf-text-card-title-lg: 20px` | `text-card-title-lg` |
| Spacing | `--cf-page-padding: 20px` | `px-page`, `-ml-page` |
| Spacing | `--cf-section-gap: 40px` | `mb-section` |
| Spacing | `--cf-card-padding: 20px` | `p-card` |
| Spacing | `--cf-card-gap: 14px` | `gap-card-gap` |
| Spacing | `--cf-heading-to-content: 16px` | `mb-heading-gap` |
| Radius | `--cf-radius-default: 4px` | `rounded-default` |
| Radius | `--cf-radius-chip: 20px` | `rounded-chip` |

For tokens not suited to Tailwind utilities (line-height, letter-spacing, interactive values), use them directly as `var(--cf-...)` in arbitrary values or inline styles:
- `leading-[var(--cf-body-line-height)]`
- `tracking-[var(--cf-text-label-spacing)]`
- `style={{ transitionDuration: "var(--cf-press-duration)" }}`

`guest/cruise/cruise-home.tsx` is the reference implementation. Apply the same token utilities when working on other guest components.

## Shared Guest Primitives

Before adding inline UI patterns to a guest component, check if a shared primitive already exists:

| Need | Use |
|---|---|
| Price display (`FREE` / `$$$`) | `formatPrice(priceLevel)` from `@/lib/utils` |
| Full-screen loading overlay | `<LoadingSpinner />` from `@/components/guest/primitives/loading-spinner` |
| Wait for image before showing page | `const { loaded, imgRef, settle } = useImageLoaded(url)` from `@/hooks/use-image-loaded` — then `{!loaded && <LoadingSpinner />}` and `<img ref={imgRef} onLoad={settle} onError={settle} />` |
| Inline clipboard copy button | `<CopyButton text={...} label={...} />` from `@/components/guest/primitives/copy-button` |
| Animated accordion row | `<AccordionItem title isOpen onToggle>` from `@/components/guest/primitives/accordion-item` |
| Card with decorative corner brackets | `<CornerBracketCard className?>` from `@/components/guest/primitives/corner-bracket-card` |
| Numbered section header + underline | `<SectionHeader number="01" title="..." />` from `@/components/guest/primitives/section-header` |
| Button press scale animation | `const p = usePressScale(); <button {...p}>` from `@/hooks/use-press-scale` |
| Sticky nav (list pages: Dining, Info, Explore) | `<StickyHeader venueName scrolled backHref nameHref />` + `const { scrolled, sentinelRef } = useStickyScroll()` from `@/components/guest/primitives/sticky-header` — always visible, border appears on scroll |
| Sticky nav (hero detail pages: place, restaurant) | `<ScrollRevealStickyHeader ... />` + `<FloatingBackButton scrolled ... />` + `const scrolled = useWindowScroll()` from `@/components/guest/primitives/sticky-header` — header fades in on scroll, glass back pill visible over hero |
| Sticky nav with section tabs (services, ship-info) | Custom fixed div using `const { showStickyNav, headerRef } = useStickyNav()` from `@/hooks/use-sticky-nav` — slides down from top, name row uses absolute-centered pattern matching `StickyHeader` |
