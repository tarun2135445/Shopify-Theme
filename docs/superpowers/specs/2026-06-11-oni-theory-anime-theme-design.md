# Oni Theory — Animated Anime Streetwear Theme Design

**Date:** 2026-06-11
**Store:** onitheory.com (Shopify Basic, INR)
**Base theme:** Shopify Horizon (this repo, unmodified — `settings_data.json` is empty)

## Goal

Transform the stock Horizon theme into a distinctive, animated storefront for **Oni Theory**,
an anime streetwear brand selling hoodies, t-shirts, and accessories. Populate the live store
with collections and products so the theme renders with real content.

## Aesthetic Direction: "Midnight Kabukichō"

Dark, neon-lit Tokyo back-alley energy. Oni (鬼) demon iconography. Heavy condensed type
like manga title cards. Disciplined duotone with one violent accent.

### Color system (Horizon color schemes)

| Scheme | Role | Background | Text | Primary accent |
|--------|------|-----------|------|----------------|
| scheme-1 | Default dark | `#0B0B10` sumi ink | `#F2EFE9` bone | `#FF3346` oni crimson |
| scheme-2 | Crimson slab (CTAs, marquee) | `#C8102E` | `#0B0B10` | `#0B0B10` |
| scheme-3 | Bone light (contrast sections) | `#F2EFE9` | `#0B0B10` | `#C8102E` |
| scheme-4 | Deep violet night (alt dark) | `#12101C` | `#EDE9F8` | `#FF3346` |
| scheme-5 | Charcoal card | `#15151C` | `#F2EFE9` | `#FF3346` |
| scheme-6 | Transparent-header dark | `#0B0B10` | `#F2EFE9` | `#FF3346` |

All six schemes get full button/input/variant color definitions (dark inputs, crimson primary
buttons with bone text, ghost secondary buttons).

### Typography (Shopify font library handles)

- **Headings:** Anton (`anton_n4`), uppercase, tight letter-spacing — manga shout type
- **Body:** Archivo (`archivo_n4`) — sturdy grotesque
- **Subheading/accent:** Anonymous Pro (`anonymous_pro_n4`) mono, uppercase — technical SKU-label feel
- H1 scaled large (~64px), uppercase via `type_case_h1/h2/h3: "upper"`

## Animation Plan ("it should be animated")

1. **Horizon built-ins enabled:** view-transition page transitions, product transitions,
   fly-to-cart animation, card hover `lift`, second-image-on-hover, product card carousel.
2. **`assets/oni-fx.css`** (wired into `snippets/stylesheets.liquid`):
   - Scroll-driven reveal animations (`animation-timeline: view()`) behind `@supports`, with
     `prefers-reduced-motion` guards — zero JS
   - Neon pulse glow on primary buttons
   - Glitch hover effect on headings in hero/jumbo text
   - Scanline/grain atmosphere overlay utilities
3. **`sections/oni-fx-hero.liquid`** — new custom section, self-contained CSS animations:
   - Giant glitch-animated brand headline + kanji watermark (鬼)
   - Drifting sakura petals (pure CSS particles)
   - Animated neon haze gradient + scanlines
   - Configurable heading/subheading/buttons via schema, preset registered
4. **Marquee sections** (Horizon native, already animated) used twice on the homepage.

## Homepage (`templates/index.json`)

1. `oni-fx-hero` — ONI THEORY glitch hero
2. `marquee` — scrolling: NEW DROPS 新着 / FREE SHIPPING / LIMITED RUNS (crimson scheme-2)
3. `collection-links` — spotlight links: Hoodies / T-Shirts / Theory 001 (hover-image reveal)
4. `product-list` — "HEAVYWEIGHT HOODIES" (collection: hoodies)
5. `product-list` — "GRAPHIC TEES" (collection: t-shirts)
6. `section` with jumbo-text "JOIN THE HORDE" + email-signup block (drop alerts)
7. Footer group restyled; announcement bar with oni copy; transparent sticky header on home.

## Store Content (via Shopify MCP connector)

- Collections already exist: Hoodies (TYPE=Hoodie), T-Shirts (TYPE=T-Shirt), Theory 001 (manual)
- Create ~6–8 products with AI-generated imagery (Higgsfield connector → public URLs → Shopify):
  3 hoodies, 2–3 tees, 1–2 accessories ("other stuff": cap, art print)
- INR pricing: hoodies ₹3,499–3,999, tees ₹1,499–1,799, accessories ₹599–1,299
- Size variants S–XXL for apparel, `product_type` set so smart collections auto-fill,
  all products added to Theory 001
- Collection images set from generated assets

## Deployment & Verification

- `shopify theme check`-style validation: Liquid/JSON syntax checks locally
- Push via Shopify CLI (`shopify theme push --store onitheory.com`) if authenticated;
  fall back to Admin GraphQL `themeFilesUpsert` via connector; else document the command
- Verify rendered storefront (preview URL) after push

## Approaches Considered

1. **Settings-only restyle** (settings_data + index.json, no new files) — safest, but can't
   deliver glitch/petal/neon animation; rejected as not "animated" enough.
2. **Chosen: settings + one custom FX hero section + one custom CSS file** — distinctive
   animation with minimal surface area touching Horizon internals; custom code is additive
   and isolated, upgrade-friendly.
3. **Full custom section suite** (custom product cards, animated collection grid, JS particle
   systems) — maximum spectacle, but high risk of fighting Horizon's web components and
   blowing the maintenance budget; rejected (YAGNI).

## Error handling / constraints

- All custom CSS behind `prefers-reduced-motion: no-preference` where motion is decorative
- Custom section degrades to static hero without CSS animation support
- Font handles must exist in Shopify font library (Anton/Archivo/Anonymous Pro verified choices)
- Image generation budget-capped; products fall back to imageless creation if generation fails
