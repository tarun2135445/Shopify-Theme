# Oni Theory — SEO Audit & Fix Report

- **Site:** onitheory.com (perm. `wiffup-if.myshopify.com`) — anime streetwear, Shopify Horizon 3.5.1
- **Date:** 2026-06-21
- **Scope:** Code-level audit of the theme source (storefront is password-protected + theme is **unpublished**, so a live crawl was not run). Findings target the theme's SEO surface: `layout/theme.liquid`, `snippets/meta-tags.liquid`, `sections/header.liquid`, `config/settings_schema.json`.
- **Business type:** E-commerce (apparel / streetwear)

## Executive Summary

Stock Horizon ships a strong SEO baseline (canonical, Open Graph, Twitter cards, smart `<title>`, and **native `Product` JSON-LD** via `{{ product | structured_data }}`). The audit found a small set of real, fixable gaps — all now patched in code.

**SEO Health (code-level, post-fix): ~88/100.** The largest remaining levers are merchant configuration and publishing the theme, not code.

### Top issues found (all fixed)
1. **`<meta name="description">` had no fallback** — only rendered when `page_description` was set, so the homepage (and any page without an explicit SEO description) shipped no description at all. *(Matches the "homepage missing meta description" item from the 2026-06-13 session.)*
2. **`og:image` rendered nothing when a page had no image** — imageless social share cards on the homepage, collection pages, policy pages, etc.
3. **`Organization` structured-data `url` bug** — it was set to `request.origin | append: page.url`, i.e. the *current page's* path, so the brand entity claimed a different URL on every page (e.g. `/products/xyz`). Must be the site root.
4. **No `WebSite` + `SearchAction` entity** — no eligibility for Google's sitelinks search box on brand queries.
5. **Dead `twitter:site` + no social settings** — `meta-tags.liquid` referenced `settings.social_twitter_link`, but no social settings existed in `settings_schema.json`, so the tag never fired and there were no `sameAs` signals.
6. **Empty `theme-color`** and no `twitter:image`.

## Fixes applied (this change)

| # | File | Fix |
|---|------|-----|
| 1 | `snippets/meta-tags.liquid` | `<meta name="description">` now falls back `page_description → shop.description` |
| 2 | `snippets/meta-tags.liquid` | `og:image` fallback chain `page_image → settings.share_image → settings.logo`; added `twitter:image` |
| 3 | `snippets/meta-tags.liquid` | `theme-color` set to brand ink `#0B0B10`; robust `twitter:site` handle parse (works for x.com) |
| 4 | `sections/header.liquid` | `Organization.url` → site **root** (`request.origin`); `@context` → `https://schema.org`; added `sameAs` from social settings |
| 5 | `sections/header.liquid` | Added homepage-only `WebSite` + `SearchAction` JSON-LD (sitelinks search box) |
| 6 | `config/settings_schema.json` | New **"Social media & sharing"** group: `share_image` + Instagram/TikTok/X/YouTube URL fields |

## Left as-is (already correct)
- **`Product` structured data** — `product-information.liquid` uses Shopify's native `structured_data` filter (offers, price, availability, SKU, brand, images). Hand-rolling would be a downgrade.
- **`Article` structured data** — present in `main-blog-post.liquid`.
- **Canonical, robots, sitemap** — canonical is emitted by the theme; `robots.txt`/`sitemap.xml` are Shopify-generated (no `robots.txt.liquid` override needed).

## Action plan — merchant / next steps (no code)

**Critical (do to realize the fixes)**
- [ ] **Publish the Oni Theory theme.** It is currently UNPUBLISHED (`OnlineStoreTheme/200377532759`); live MAIN is stock Horizon. None of these fixes are live until it's published.
- [ ] **Remove the storefront password** when ready — a password-protected store is `noindex` and cannot rank or be crawled.

**High**
- [ ] **Theme editor → Social media & sharing:** upload a 1200×630 **share image** and paste the Instagram/TikTok/X/YouTube URLs (powers `og:image` fallback, `twitter:site`, and `sameAs`).
- [ ] **Online Store → Preferences:** set the **homepage title & meta description** (the theme now also falls back to the store description if this is blank).
- [ ] Ensure **store description** is filled (Settings → General) as the description fallback.

**Medium**
- [ ] Confirm product images have descriptive **alt text** (drives image search + accessibility; not auditable from theme code).
- [ ] After publishing, re-run **Lighthouse / Rich Results Test** on a product URL to confirm Product + Organization + WebSite schema validate.

## Notes / limitations
- No live crawl (password-protected + unpublished). Content-quality and live Core Web Vitals were not re-measured; prior baseline (2026-06-13) was mobile Lighthouse **SEO 92 / A11y 92 / Best Practices 77** (BP dragged only by Shop Pay 3rd-party cookies — platform, not fixable).
- Liquid changes mirror stock Horizon patterns; `settings_schema.json` validated as well-formed JSON (theme editor safe).
