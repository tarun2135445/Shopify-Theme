# Full Audit — onitheory.com (July 2026)

**Scope:** Technical SEO · AEO/GEO · Performance · Conversion (CRO) · Code quality · Store content
**Sources:** Theme code on `main`, live-site probes, Shopify Admin API, CrUX field data.
Supersedes `2026-06-ecommerce-audit.md` and `2026-06-aeo-geo-audit.md` (kept for history).

---

## Scorecard

| Dimension | Status | Notes |
|---|---|---|
| Structured data (schema.org) | ✅ Strong | Organization+sameAs, WebSite+SearchAction, BreadcrumbList, Product (+ratings, priceValidUntil), FAQPage — all verified live |
| Crawlability / technical SEO | ✅ Strong | robots.txt (AI crawlers welcomed), sitemap 200, canonical, 404 correct, https+apex 301s |
| AEO/GEO endpoints | ✅ Strong | Native Shopify `/llms.txt` + curated `/pages/llms` manifest + `/pages/faq` FAQPage |
| Performance (code) | ✅ Good | LCP preload, speculation-rules prefetch, scoped motion JS, font swap+preload. Field data (CrUX) lags ~28 days |
| Performance (third-party) | ⚠️ Action needed | KwikCart/analytics app scripts inject jQuery on every page — biggest INP tax now |
| Store content (products) | ✅ Fixed | All active products now have SEO title+description |
| Store content (blog/GEO) | 🔴 Gap | Blog "News" has **0 articles** — no editorial content for engines to cite |
| Conversion path | ⚠️ Partial | Trust row/size guide/payment icons/free-ship bar done; reviews app + pixel verification outstanding |
| Code quality | ✅ Fixed | theme-check passes at error level; locale JSON comment corruption fixed; unused assets removed |

---

## Fixed in this audit round

### Store-side (applied via Admin API — already live)
1. **7 products were missing SEO title/description** (TEMPEST, VOID REAPER, and the 5 newest character tees) → written in house style.
2. **Footer menu had only "Search"** → now: Search · FAQ · Size Guide · Shipping & Returns · The Theory — Our Story · Contact. (Policy links render separately via the footer-policy-list block.)
3. Earlier this cycle: FAQ page created (FAQPage schema live), LLMs page published on the `llms` template, `/llms.txt` redirect (now shadowed by Shopify's native llms.txt — harmless fallback).

### Theme code (this PR)
4. **Locale JSON corruption:** 112 `//` comment lines inside `locales/en.default.json` + `en.default.schema.json` — invalid JSON that breaks strict parsers and Shopify's translation tooling. Stripped; both files now parse.
5. **Unused assets deleted:** `icon-account.svg`, `icon-double-chevron.svg`, `icon-orders.svg` (zero references in liquid/json/js).
6. Root-level audit docs moved to `docs/audits/`.

### Previous rounds (already merged & verified live)
- https `og:image` + `og:image:alt` + x.com twitter handle; `priceValidUntil` in product schema.
- PDP LCP image early-hint preload; speculation-rules hover prefetch; duplicate script removed.
- Liquid syntax error that made Shopify's GitHub sync silently drop `page.llms.liquid` (root-caused: multi-line `{% # %}` comments need `#` on every line).

---

## Needs YOU (can't be done via API from here)

Ranked by impact:

1. **Verify Meta Pixel + CAPI fire Purchase events** (Phase 0 of the conversion plan). If ads run blind, nothing else matters. Meta Events Manager → test checkout.
2. **Install a reviews app** (Judge.me free tier). The theme + JSON-LD are pre-wired for `reviews.rating` metafields — stars appear on cards/PDP/Google the moment data exists. Highest-ROI trust lever for cold traffic.
3. **Shipping policy is empty** in Settings → Policies (API scope `write_legal_policies` not granted). Paste the Shipping & Returns page content there — it shows at checkout, where trust matters most.
4. **Homepage social-share image + meta description**: Online Store → Preferences. `shop.description` is empty — it feeds the homepage meta description fallback, Organization schema, and the llms manifest tagline.
5. **App-script cleanup (INP):** the KwikCart (`gk_cart_domain`) loader and a jQuery-injecting analytics ScriptTag run on every page. If not actively used → uninstall app / remove App embed (Themes → Customize → App embeds).
6. **Write 2–3 blog articles** (sizing guide for oversized fits, print-care, drop lore). Blog exists with 0 articles — this is the main remaining GEO/content gap; answer engines cite editorial content.
7. **IP risk (flagging, your call):** the 5 newest tees use licensed anime characters/names (JJK, Naruto, Black Clover, Frieren). Marketplaces and Meta ads reject these regularly; a takedown risk for the store.
8. **Housekeeping / deletions (recommend, needs your confirmation):**
   - Archived test products "Solo Hoodie" & "solo jin hoodie" → delete.
   - Unpublished themes: 2× "Horizon", "Impulse" demo, "Copy of Shopify-Theme/main" → delete stale ones (theme deletion is blocked for the API here).
   - Drafts "Dragon Spirit Tee" & "OUTCAST Tee": activate (they have art + SEO) or delete.
9. **Menu merchandising (suggestion):** main menu lacks New Arrivals / Under ₹999 / Drop 002 — your three strongest browse entry points.

## Validation checklist (after this PR syncs)
- Language editor loads clean (locale JSON fix): Online Store → Themes → ⋯ → Edit default theme content.
- Footer shows the new links sitewide.
- Rich Results Test on a product URL → Product + Breadcrumbs, no warnings.
- CrUX re-check ~4 weeks out (late July): expect LCP/INP/FCP to step down as post-fix sessions accumulate.
