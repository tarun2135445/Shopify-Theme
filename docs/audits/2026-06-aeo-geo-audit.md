# AEO & GEO Audit — Oni Theory Shopify Theme

**Store:** Oni Theory (onitheory.com) · Apparel · Shopify Basic
**Scope:** Theme code (`claude/busy-ramanujan-tog8r2`) — the source of truth for what renders to crawlers
**Date:** 2026-06-30

> **AEO** (Answer Engine Optimization) = being surfaced and cited by AI answer engines (ChatGPT Search, Perplexity, Google AI Overviews, Copilot).
> **GEO** (Generative Engine Optimization) = being correctly understood and represented as an *entity* by generative models.
> Both are driven by the same levers: **machine-readable structured data**, **clean entity signals**, and **answer-shaped, crawlable content**.

> ⚠️ Live-site validation (`onitheory.com`) was blocked by the sandbox network policy (the agent proxy denies that host — a 403 at the CONNECT layer, not a store problem). Findings below are derived from the theme source. Re-run the live validators listed at the end once published.

---

## Overall readiness: 5 / 10

| Dimension | Score | Notes |
|---|---|---|
| Structured data (schema.org) | 5/10 | Product + Article + Organization present; **no Breadcrumb, FAQ, WebSite, or Rating schema**; Organization has bugs |
| Meta & crawlability | 6/10 | Good OG/Twitter/canonical foundation; **meta description has no fallback**; dead Twitter setting |
| Semantic HTML & accessibility | 8/10 | `<main role>`, `lang`, skip-link, correct homepage-only H1, alt-text plumbing — solid |
| AEO answerability (FAQ / Q&A) | 3/10 | Accordion FAQ content exists but emits **zero FAQ schema** |
| GEO entity signals (sameAs / KG) | 3/10 | **No social settings at all** → no `sameAs`; Organization `url` is wrong |

**One-line verdict:** Good *technical SEO* foundation, but specifically under-built for answer/generative engines — the high-value AEO/GEO schemas (FAQ, Breadcrumb, WebSite, Ratings) and entity signals (sameAs) are missing, and a couple of small bugs suppress data that should be rendering.

---

## ✅ What's already working

- **Product structured data** — `{{ product | structured_data }}` in `sections/product-information.liquid:4`, `sections/featured-product.liquid:4`, `sections/featured-product-information.liquid:4`. Emits `Product` + `Offers` (price, availability, currency).
- **Article structured data** — `{{ article | structured_data }}` in `sections/main-blog-post.liquid:63`. Emits `BlogPosting`/`Article`.
- **Organization schema** present in `sections/header.liquid:287` (but see bugs below).
- **Canonical URLs** — `snippets/meta-tags.liquid:117` (`rel="canonical"` → `canonical_url`).
- **Open Graph** — full set (`og:site_name/url/title/type/description/image` + dimensions + `og:price:*` on products), `meta-tags.liquid:40–89`.
- **Twitter Cards** — `summary_large_image`, `meta-tags.liquid:97–108`.
- **Semantic HTML** — `<main id="MainContent" role="main">` (`layout/theme.liquid:117`), `lang="{{ request.locale.iso_code }}"` (`theme.liquid:6`), skip-to-content link (`theme.liquid:44`).
- **Correct H1 discipline** — the visually-hidden shop-name `<h1>` is gated to `request.page_type == 'index'` (`header.liquid:332`), so it does **not** create duplicate H1s on product/collection pages. 👍
- **Image alt plumbing** — `snippets/image.liquid:19` resolves `image.alt` with a fallback; product media passes `media.alt`.
- **Performance hints** — lazy loading across sections, view-transition render hints (`theme.liquid:19–26`). Page speed is a ranking + crawl-efficiency input.

---

## 🔴 Critical gaps (highest AEO/GEO impact)

### 1. No `FAQPage` structured data — biggest AEO miss
`blocks/accordion.liquid` ships FAQ-shaped content by default (Return Policy, Shipping, Manufacturing — see presets at `accordion.liquid:254–311`) and is reusable on any page, but emits **no** `FAQPage`/`Question`/`Answer` JSON-LD. FAQ schema is the single most citation-friendly format for answer engines — it maps a question directly to an extractable answer.
**Fix:** Add an optional `FAQPage` JSON-LD emitter to the accordion block (toggle in schema), built from each `_accordion-row` heading (Question) + text (Answer).

### 2. No `BreadcrumbList` schema
No breadcrumb structured data anywhere (`grep` confirms zero matches). Answer engines use breadcrumbs to understand catalog hierarchy and to attribute a product to its category/collection.
**Fix:** Add a `snippets/breadcrumbs.liquid` that renders both visible breadcrumbs **and** `BreadcrumbList` JSON-LD on product, collection, blog, and article templates.

### 3. No `WebSite` + `SearchAction` schema
No sitelinks-search-box / site-entity schema. This is the canonical signal that tells engines "this is the site entity, and here's how to search it."
**Fix:** Add a `WebSite` JSON-LD block (with `potentialAction` → `SearchAction` pointing at `/search?q={search_term_string}`) in the head, homepage scope.

### 4. Product ratings are invisible to engines
Reviews exist (`sections/product-reviews.liquid`, `blocks/review.liquid`) but no `AggregateRating`/`Review` JSON-LD is emitted, and Shopify's `structured_data` filter does **not** add ratings. Star ratings are a top trust/citation signal in AI Overviews and Perplexity product answers.
**Fix:** If ratings live in a metafield (e.g. a reviews app or `metafields.reviews.rating`), inject `aggregateRating` into the product schema. (Requires a custom JSON-LD block rather than the bare `structured_data` filter.)

### 5. Organization schema bugs (`header.liquid:287–297`)
```liquid
"@context": "http://schema.org",                       // ① should be https://
"url": {{ request.origin | append: page.url | json }}  // ② resolves to the CURRENT page, not the homepage
```
- ① `http://` → use `https://schema.org`.
- ② `request.origin | append: page.url` makes `url` whatever page the header renders on (every page). Organization `url` must be the canonical site root → use `request.origin` / `shop.url` only.
- ③ **No `sameAs`** (social profiles) → weak entity disambiguation. This is the #1 GEO entity signal for tying the brand to its Knowledge-Graph identity.
- ④ No `description` / `contactPoint`.

---

## 🟠 Meta & crawlability gaps

### 6. Meta description has no fallback (`meta-tags.liquid:122–127`)
```liquid
{% if page_description %}
  <meta name="description" content="{{ page_description | escape }}">
{% endif %}
```
If a page (commonly the **homepage**) has no SEO description set, **no `<meta name="description">` renders at all** — even though OG description *does* fall back (`page_description | default: shop.description | default: shop.name`, line 29). Engines and AI snippets then invent their own summary.
**Fix:** Mirror the OG fallback chain for the standard meta description.

### 7. Dead Twitter setting + no social settings exist at all
`meta-tags.liquid:91` reads `settings.social_twitter_link`, but **no `social_*` settings are defined** in `config/settings_schema.json` (grep: zero matches for twitter/facebook/instagram). So:
- `twitter:site` never renders, and
- there is **no way for the merchant to enter any social URL** → `sameAs` (finding #5③) is impossible without this.
**Fix:** Add a "Social media" settings group (Instagram, TikTok, X/Twitter, YouTube, Facebook, Pinterest) and wire it into both `twitter:site` and the Organization `sameAs` array.

### 8. Empty `theme-color` meta (`meta-tags.liquid:20–23`)
`content=""` — harmless but wasted. Set to the brand/primary scheme color.

### 9. No `llms.txt`
No `llms.txt` (the emerging llmstxt.org convention for pointing AI engines at canonical content). Shopify won't auto-generate it; it must be served at the domain root (e.g. via a Shopify redirect/app or a page). Low effort, forward-looking AEO signal.

---

## 🟡 Content / answerability (GEO) — merchant-side

These are **store-admin/content** actions (not theme code), but they gate AEO/GEO performance:

- **SEO titles & descriptions** — ensure homepage, top collections, and hero products have hand-written meta descriptions (ties to finding #6).
- **Image alt text** — the theme plumbs alt correctly, but it's only as good as the alt text entered on products in admin. AI image understanding + accessibility both depend on it.
- **Answer-shaped copy** — add real FAQ content (sizing, materials, shipping to India/intl, returns) on product and policy pages; this is what the FAQ schema (finding #1) will expose.
- **Social profiles** — populate them (feeds finding #7 → `sameAs`).
- **Sitemap** — Shopify auto-serves `/sitemap.xml`; confirm it's submitted in Google/Bing Search Console.

---

## Recommended implementation order (theme code)

| # | Change | File(s) | Effort | AEO/GEO impact |
|---|---|---|---|---|
| 1 | `FAQPage` JSON-LD from accordions | `blocks/accordion.liquid` (+`_accordion-row`) | M | ★★★ |
| 2 | `BreadcrumbList` snippet + JSON-LD | new `snippets/breadcrumbs.liquid`, templates | M | ★★★ |
| 3 | Fix Organization schema (https, url, +`sameAs`, +description) | `sections/header.liquid` | S | ★★★ |
| 4 | Add Social-media settings group | `config/settings_schema.json` | S | ★★★ (enables #3) |
| 5 | Meta description fallback | `snippets/meta-tags.liquid` | XS | ★★ |
| 6 | `WebSite` + `SearchAction` schema | `snippets/meta-tags.liquid` or new snippet | S | ★★ |
| 7 | Product `aggregateRating` (if metafield exists) | `sections/product-information.liquid` | M | ★★ |
| 8 | `theme-color` value + remove dead twitter ref | `snippets/meta-tags.liquid` | XS | ★ |

## How to validate (post-publish)
- **Google Rich Results Test** — products, articles, FAQ, breadcrumbs.
- **Schema.org Validator** (validator.schema.org) — full JSON-LD lint.
- **Google Search Console** → Enhancements (Products, Breadcrumbs, FAQ) + sitemap status.
- **Live source check** — `view-source:` the homepage + a product page; confirm each `application/ld+json` block parses and `url`/`@context` are correct.
- **AI spot-check** — ask Perplexity/ChatGPT "What is Oni Theory and what do they sell?" to see how the brand entity is currently represented.
