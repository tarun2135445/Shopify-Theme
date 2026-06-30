# Oni Theory — Full eCommerce Growth & Conversion Audit

**Prepared as an independent CRO / SEO / UX / brand consultant engagement.**
**Date:** 19 June 2026
**Brand:** Oni Theory (鬼の理論) — anime streetwear
**Store:** https://www.onitheory.com
**Market:** India (INR / ₹), made-to-order print-on-demand apparel
**Platform:** Shopify, "Horizon" theme v3.5.1 (heavily customized)

> This is a blunt assessment, not a pat on the back. The theme is genuinely
> well-built and visually distinctive — that is not your problem. Your problem
> is **trust, focus, proof, and mobile performance**, plus a handful of issues
> that are quietly capping conversion. Evidence is cited by file path.

---

## TL;DR — The single most important finding

You have spent your energy on **aesthetics and motion** (parallax, CRT
scanlines, drag carousels, a hoodie designer, a Remotion film) and almost none
on the **boring trust mechanics that actually make strangers spend money with an
unknown Indian apparel brand**: real social proof, real social accounts, real
contact details, real delivery expectations, and a fast mobile experience.

For a new DTC brand, **trust is the conversion bottleneck — not design.** Fix
that first.

---

# PHASE 1 — Business Analysis

### What the business sells
Heavyweight anime-inspired streetwear — hoodies, graphic tees, accessories, a
"Theory-001" drop, and a **custom hoodie designer**. Pricing is in ₹, fulfilment
is **made-to-order / print-on-demand** (evidence: `designs/QIKINK-SKU-MAPPING.md`,
`designs/PRINTROVE-SKU-MAPPING.md`, copy "Made-to-order in India").

### Target audience
Indian Gen-Z / young-millennial anime fans (otaku) who want "premium, limited,
edgy" streetwear rather than cheap printed tees. The Japanese motifs (鬼, kanji,
"Tokyo Midnight Division") signal a niche, identity-led buyer.

### Is the value proposition clear?
**Partially.** The *vibe* is crystal clear ("anime streetwear forged after
dark… limited runs"). The *reasons to buy* are not. A shopper cannot quickly
answer: Why is this better/different from Animecult or The Souled Store? What
weight/GSM is the fabric? How long until it arrives? Why does limited = good for
*me*? **Aesthetic ≠ value proposition.**

### Positioning weaknesses
1. **"Limited runs" + "made-to-order" is a contradiction.** Made-to-order is
   inherently unlimited; claiming scarcity you don't have erodes trust the
   moment a customer notices nothing ever sells out.
2. **No licensed IP.** "Anime-inspired" original designs are legally safer but
   far harder to sell than recognisable characters (Naruto, JJK, One Piece) that
   competitors lean on. You are asking people to love *your* designs, not their
   favourite series — a much steeper ask with zero brand equity yet.
3. **Premium positioning, unproven brand.** Sharp corners, Anton display type
   and neon say "premium." Nothing on the site *earns* the premium price.

### Why customers may choose competitors instead
- **The Souled Store / Bewakoof** — official licensed anime merch, massive trust,
  fast delivery, frequent sales, easy returns. The default for Indian anime fans.
- **Animecult.in / Merchstreet.in / Swag Apparels** — recognisable characters,
  lower prices, established review counts, active Instagram.
- Against these, Oni Theory currently offers: cooler design language, but **less
  proof, no recognisable IP, slower (made-to-order) delivery, and placeholder
  social accounts.** A rational first-time buyer picks the safer option.

---

# PHASE 2 — Website Analysis (page-by-page, scored /10)

> Note: the live site returns **HTTP 403** to standard crawlers/fetchers
> (likely Gokwik/WAF bot protection). **Verify in Google Search Console that
> Googlebot and social/link-preview crawlers are NOT being blocked** — if they
> are, this alone is sabotaging SEO and paid-social link previews. Treat this as
> a Phase-3 critical item. Scores below combine code evidence with standard
> heuristics.

### Homepage — 6/10
Evidence: `templates/index.json`, `sections/oni-fx-hero.liquid`.
- **Strong:** distinctive hero, clear category links, branded copy, reviews
  block, email capture.
- **Conversion blockers:** hero is `90svh` — pushes product and proof below the
  fold on mobile; vanity stats ("15 designs / 24H / 100% limited") instead of
  trust stats ("4.9★ from X buyers", "10,000+ shipped"); heavy motion delays
  first meaningful paint.
- **Weak copy:** lots of mood ("forged after dark"), little substance (fabric,
  fit, delivery, guarantee).

### Product pages — 6.5/10
Evidence: `sections/product-information.liquid`, `blocks/_product-details.liquid`,
`blocks/product-inventory.liquid`, trust line in `templates/product.json`.
- **Strong:** sticky add-to-cart, variant picker, recommendations, size-guide
  link, Product structured data via `{{ closest.product | structured_data }}`,
  trust line ("7-day returns · secure checkout · made-to-order in India").
- **Blockers:** "Made-to-order in India" with no **dispatch/delivery date** =
  the #1 silent killer for POD ("when will it actually arrive?"); review
  authenticity (see Phase 3); no fabric/GSM/care detail surfaced; no COD
  reassurance despite COD being decisive in India.

### Collection pages — 6/10
Evidence: `sections/main-collection.liquid`, `facets.js` (26KB).
- Filtering/sorting present. Risks: thin catalogue makes collections look empty;
  no collection-level copy for SEO; heavy filter JS on mobile.

### About page — 3/10 (assumed generic)
No dedicated, evidence-backed brand-story section was found beyond footer copy.
For an unknown premium brand, a missing/weak About page is a major trust gap.
**This is where you justify the price and the "limited drops" philosophy.**

### Contact page — 4/10
Evidence: `templates/page.contact.json` — form with name/email/phone/comment.
**No physical address, phone, or support email surfaced.** In India, where COD
distrust is high, a faceless contact page suppresses orders. Add real contact
details + WhatsApp.

### Checkout flow — not directly auditable (Shopify-hosted) — 5/10
Gokwik cart drawer is integrated (good for India: COD + UPI). Risks: auto-open
drawer (`settings_data.json`) can annoy; confirm COD, UPI, and free-shipping
threshold are all visible *before* checkout.

### Mobile experience — 5/10
This is **your most important channel and your weakest area.**
- Quick-add **disabled on mobile** (`settings_data.json`) — removes one-tap add.
- ~1.3MB of theme assets; the genuinely site-wide custom stack is heavy:
  `motion.min.js` (65KB) + `oni-motion.js`, `oni-fx.js` (38KB) + `oni-fx.css`
  (46KB), and `polly-fx.js` — all loaded globally via `scripts.liquid` /
  `stylesheets.liquid`. (Note: `qr-code-generator.js` is gift-card-only and the
  hoodie-designer bundle is loaded by its section — both already page-scoped.)
- `border-radius: 0` everywhere + dense motion can feel harsh and janky on
  mid-range Android, which is the bulk of the Indian market.

---

# PHASE 3 — Conversion Rate Optimization

### Missing / weak trust signals
- **Placeholder social links** — `https://www.facebook.com/`, `instagram.com/`,
  `x.com/`, etc. in `sections/footer-group.json`. Links that go to the social
  network's homepage scream "fake/abandoned brand." **Critical.**
- **Reviews appear seeded, not real.** Git history: *"Add Indian testimonials,"
  "Add more Indian testimonials," "add Indian seed reviews."* Hardcoded
  testimonials with Indian names are **fake social proof** — a trust bomb if
  noticed, a Google "fake reviews" / India ASCI consumer-law risk, and they
  cannot generate genuine AggregateRating. **Critical.**
- No physical address / phone / support email.
- No delivery-time promise for made-to-order.
- No COD-specific reassurance.
- No FAQ schema; no Breadcrumb schema (now added — see Quick Wins).

### Weak CTAs
"Summon me," "Shop the drop" are on-brand but vague. Test outcome-driven CTAs
("Shop hoodies — ₹999," "Get 10% off your first drop").

### Poor hierarchy / friction
- 90svh hero buries product + proof.
- Vanity stat HUD where a trust bar should be.
- Auto-opening cart drawer.
- Mobile quick-add off.

### Abandoned-cart risks
- Unclear delivery date on a made-to-order product.
- COD trust gap.
- No urgency that's *honest* (real low-stock or drop-closing timers, not fake).

### Performance / slow elements (mobile conversion)
- Render-blocking view transitions: `view-transitions.js` loads with
  `blocking="render"` and `theme.liquid` adds `rel="expect" blocking="render"`
  on `#MainContent` (lines 19–26) — this **delays first paint** to make
  transitions smooth. Pretty, but it costs LCP on slow connections.
- The always-on motion/effects stack (`motion.min.js` 65KB, `oni-motion.js`,
  `oni-fx.js` 38KB + `oni-fx.css` 46KB, `polly-fx.js`) ships on every page from
  `scripts.liquid`/`stylesheets.liquid` — lazy-load or conditionally enqueue it
  so pages that don't need the effects don't pay for them.

### Recommendations by effort
**Quick wins (< 1 day)** — *several already implemented in this PR:*
- ✅ Fill empty `theme-color` meta (was `content=""`).
- ✅ Add `twitter:image` for proper large-image social cards.
- ✅ Add `BreadcrumbList` structured data on product & collection pages.
- Replace placeholder social URLs with real accounts (or remove the icons).
- Add real contact details + WhatsApp to the contact page/footer.
- Add an explicit dispatch/delivery line ("Ships in 3–5 days, delivered in
  7–10") to every product page.
- Re-enable mobile quick-add.

**Medium impact (< 1 week)**
- Replace the seeded testimonials with a **real review app** (Judge.me / Loox —
  both strong in India and feed genuine AggregateRating into your Product
  schema). Collect photo reviews via post-purchase email.
- Turn the vanity stat HUD into a **trust bar** (rating, orders shipped, returns
  policy, secure payment, COD available).
- Shorten hero to ~65svh; surface a trust strip + bestsellers above the fold.
- Trim/lazy-load the site-wide motion stack (`motion.min.js`, `oni-motion.js`,
  `oni-fx.js`/`oni-fx.css`, `polly-fx.js`) so it loads only where it's used.

**High impact (< 1 month)**
- Reduce always-on motion/JS; lazy-load `oni-fx`/`motion` and drop
  render-blocking transitions on mobile. Target LCP < 2.5s on 4G mid-range
  Android.
- Build a real **About / brand-story** page and a **delivery & returns** page.
- Stand up email/SMS flows (welcome, abandoned cart, browse abandonment, COD
  confirmation, post-purchase review request).

---

# PHASE 4 — SEO Audit

### What's good (evidence)
- Clean meta-tags pipeline: title/description/canonical/OG/Twitter
  (`snippets/meta-tags.liquid`), now with `twitter:image` and a real
  `theme-color`.
- Product structured data via Shopify's `structured_data` filter
  (`sections/product-information.liquid:4`).
- Organization JSON-LD (`sections/header.liquid:287`).
- Sensible heading hierarchy (one H1/page), 44 locales available.
- **Breadcrumb structured data added in this PR** (`snippets/breadcrumb-schema.liquid`).

### Gaps & opportunities
- **403 to crawlers (verify!)** — if bots are blocked you cannot rank. Highest
  technical-SEO priority. Check GSC coverage + live test.
- **No real AggregateRating** because reviews are hardcoded — install a review
  app so star ratings show in Google results (huge CTR lift).
- **No collection/product long-form copy** targeting buyer keywords:
  "anime hoodies India," "oversized anime hoodie," "Naruto/JJK-style hoodie
  India," "graphic streetwear hoodie ₹999."
- **No blog/content** despite `blog.json`/`article.json` existing — content is
  your cheapest organic channel ("best anime hoodies in India," "anime
  streetwear lookbook," care/sizing guides).
- **No FAQ schema** — add FAQ to product/help pages for SERP real estate.
- Thin internal linking — link blog → collections → products with keyword anchors.

### Competitor SEO advantage
Souled Store / Bewakoof dominate licensed-character search terms and have domain
authority you can't beat head-on. **Win the long tail:** original-design,
"oversized," "heavyweight," "drop," city/college-targeted, and editorial content.

---

# PHASE 5 — Customer Journey (as a real first-time buyer in India)

1. **First impression:** "This looks cool and expensive." Then motion loads,
   page feels heavy on my phone, and I scroll past a 90svh hero to find
   products. Vibe = strong, but I don't yet know *what* or *why*.
2. **Browsing:** Designs look good but I don't recognise any anime — these are
   original. Do I trust the quality? What GSM? Catalogue feels small.
3. **Building trust:** I check reviews (look planted — same tone, all glowing),
   socials (links go to facebook.com homepage → **red flag**), contact page (no
   address/phone). My guard goes up.
4. **Purchase:** ₹999–₹1,499 from a brand I've never heard of, made-to-order,
   no clear delivery date, unsure about COD/returns. **This is where most people
   leave.**
5. **Post-purchase:** No evidence of order-update/review/winback flows → no
   repeat-purchase engine.

**Where they get confused:** value prop, delivery timing.
**Where they lose trust:** fake-looking reviews + dead social links + faceless
contact.
**Where they leave:** the payment decision, on mobile.

---

# PHASE 6 — Competitor Analysis

| Factor | Oni Theory | Souled Store / Bewakoof | Animecult / Merchstreet / Swag |
|---|---|---|---|
| Branding | **Strongest / most distinctive** | Corporate, broad | Generic anime |
| IP | Original (hard to sell) | **Licensed (easy to sell)** | Licensed characters |
| Pricing | ₹999–1,499 premium | Mid, frequent sales | Often cheaper |
| Site quality | **High (custom)** | High | Medium |
| Product presentation | Strong visuals | Strong, lots of detail | Basic |
| Trust / proof | **Weak (seeded reviews, dead socials)** | **Very strong** | Established review counts |
| Social presence | **Placeholder/none** | Massive | Active |
| Delivery | Made-to-order (slow) | Fast | Mixed |

**Why they convert better:** recognisable characters + real proof + faster
delivery + active socials + frequent promos. They remove risk; you currently
add it. Your *only* structural edge is brand/design — so you must compensate
hard on trust and proof.

---

# PHASE 7 — Marketing Analysis

- **Social:** effectively non-existent on-site (placeholder links). For an
  anime streetwear brand, **Instagram + YouTube Shorts/Reels are the entire
  game.** This is your biggest untapped channel.
- **Content:** blog engine unused; no lookbooks, no behind-the-design stories —
  exactly the content that sells *original* designs.
- **Email/SMS:** capture form exists ("Join the horde"), but no evidence of
  flows. Easiest ROI you're leaving on the table.
- **Retargeting:** verify Meta Pixel + GA4 + (if running ads) conversion API.
- **Lead gen:** offer a first-order discount for email/WhatsApp opt-in.

### 10 highest-ROI marketing actions
1. **Daily Instagram Reels** of designs on real people / process — build the
   audience you don't have.
2. **Real review engine** (Loox photo reviews) + post-purchase request flow.
3. **Email/SMS welcome + abandoned-cart + COD-confirm flows** (Klaviyo/India SMS).
4. **WhatsApp** opt-in + broadcast for drops (highest-engagement channel in India).
5. **First-order discount** popup tied to email/WhatsApp capture.
6. **Micro-influencer/cosplayer seeding** (gift product for Reels).
7. **UGC contests** ("show your fit") to manufacture authentic proof.
8. **SEO content** targeting long-tail anime-streetwear-India terms.
9. **Meta + Google retargeting** of product viewers / cart abandoners.
10. **Honest scarcity** — real timed drops with countdowns (replaces fake
    "limited runs").

---

# PHASE 8 — Data-Driven Priority Roadmap

| Priority | Action | Impact on conv. | Difficulty | Expected ROI |
|---|---|---|---|---|
| **CRITICAL (now)** | Verify crawlers aren't 403-blocked (GSC) | Very High (SEO) | Low | Very High |
| **CRITICAL** | Replace seeded reviews with a real review app | High | Med | Very High |
| **CRITICAL** | Fix/remove placeholder social links + create real IG | High | Low–Med | Very High |
| **CRITICAL** | Add real contact details + WhatsApp | Med–High | Low | High |
| **HIGH (30d)** | Add delivery/dispatch dates + COD reassurance on PDP | High | Low | Very High |
| **HIGH** | Re-enable mobile quick-add; shorten hero; trust bar | Med–High | Low | High |
| **HIGH** | Email/SMS/WhatsApp flows (welcome, cart, post-purchase) | High | Med | Very High |
| **HIGH** | Mobile performance: kill render-blocking transitions, lazy-load site-wide motion/oni-fx stack | Med–High | Med | High |
| **MEDIUM (90d)** | Real About + Delivery/Returns pages | Med | Low–Med | High |
| **MEDIUM** | SEO content + collection copy + FAQ schema | Med (compounding) | Med | High |
| **MEDIUM** | Retargeting + pixel/CAPI verification | Med | Med | High |
| **LOW (future)** | Expand catalogue / honest timed drops / loyalty | Med | Med–High | Med |

---

# FINAL REPORT

### 1) Top 20 reasons you're not getting enough sales
1. Reviews look seeded/fake → trust collapses (and SEO/legal risk).
2. Social links are placeholders → "abandoned brand" signal.
3. No real Instagram presence → no top-of-funnel for a visual niche.
4. No clear delivery date on a made-to-order product.
5. Faceless contact page (no address/phone) → COD distrust.
6. Value proposition is vibe, not substance (no fabric/fit/why-us).
7. Original designs (no licensed IP) are a hard sell with zero brand equity.
8. "Limited runs" + "made-to-order" is a contradiction customers feel.
9. Mobile experience is heavy/janky on mid-range Android (your core device).
10. Quick-add disabled on mobile → added friction.
11. 90svh hero buries products and proof.
12. Vanity stats instead of trust stats.
13. Possible crawler 403 blocking SEO and social previews.
14. No real AggregateRating → no star ratings in Google.
15. No SEO content / unused blog.
16. No email/SMS/WhatsApp lifecycle flows.
17. No retargeting of warm traffic.
18. Thin catalogue makes the store feel new/empty.
19. No honest urgency mechanism (real drop timers).
20. Premium price unsupported by any proof of quality.

### 2) The 10 biggest opportunities
1. Real, photo-based reviews (instant trust + SEO stars).
2. Instagram/Reels engine for a hyper-visual niche.
3. WhatsApp + email/SMS flows (cheap, high-ROI in India).
4. Mobile speed (biggest channel, currently weakest).
5. Clear delivery + COD reassurance (removes the #1 hesitation).
6. Brand-story content selling original designs.
7. Long-tail SEO the incumbents ignore.
8. Honest timed drops (manufacture real urgency + community).
9. First-order capture offer.
10. Retargeting warm visitors.

### 3) 30-day action plan
- **Week 1:** Verify crawler/indexing in GSC. Fix/remove social links + launch
  a real Instagram. Add contact details + WhatsApp. Add PDP delivery/COD copy.
  Re-enable mobile quick-add. *(Meta SEO quick wins already shipped in this PR.)*
- **Week 2:** Install a review app (Loox/Judge.me); migrate off seeded reviews;
  start post-purchase review requests. Replace stat HUD with a trust bar.
- **Week 3:** Stand up email/SMS/WhatsApp welcome + abandoned-cart + COD-confirm
  flows. Add first-order capture offer.
- **Week 4:** Mobile performance pass — remove render-blocking transitions,
  lazy-load the site-wide motion/oni-fx stack (`motion.min.js`, `oni-motion.js`,
  `oni-fx.js`/`.css`, `polly-fx.js`), measure LCP. Start daily Reels.

### 4) 90-day growth plan
- **Days 31–60:** Build About + Delivery/Returns pages. Ship SEO content (4–8
  articles) + collection/FAQ copy with schema. Begin micro-influencer seeding +
  UGC contest. Turn on retargeting.
- **Days 61–90:** Run first **honest timed drop** with countdowns and waitlist.
  Optimise top landing pages from real analytics. Expand winning categories.
  Introduce loyalty/referral. Iterate on best-performing Reels into paid social.

### 5) The single highest-impact change to make first
**Replace fake/seeded social proof and dead social links with real, verifiable
proof — and pair every product with a clear delivery + COD promise.**
A first-time Indian buyer purchasing a ₹999–₹1,499 made-to-order item from an
unknown premium brand needs *risk removed*. Right now your site *adds* risk
(planted reviews, dead socials, faceless contact, vague delivery). Fix the trust
layer before spending a rupee on traffic — otherwise you're pouring water into a
leaking bucket.

---

## Appendix — Changes shipped in this PR (quick wins)
- `snippets/meta-tags.liquid`: real `theme-color` (`#0b0b10`) + `twitter:image`
  for correct social cards.
- `snippets/breadcrumb-schema.liquid` (new) + render in `layout/theme.liquid`:
  `BreadcrumbList` structured data on product & collection pages for breadcrumb
  rich results.

These are additive and low-risk. Everything else above is recommendation, not
code change, and should be prioritised per the Phase-8 roadmap.

---

# SEO — Round 2 (deep technical / on-page pass)

A closer, code-level audit beyond the Phase-4 summary. Findings are split into
**fixed in this PR** and **still recommended**.

## Bugs found & fixed in this PR

### 1. Duplicate H1 on the homepage *(fixed)*
The header emitted `<h1 class="visually-hidden">{{ shop.name }}</h1>` on the
index template (`sections/header.liquid`), **and** the hero section
(`sections/oni-fx-hero.liquid:24`) emits a visible `<h1>`. Two H1s on the most
important page dilutes the primary topical signal. Fixed by demoting the header's
hidden shop-name element to a `<p>` so the keyword-rich, visible hero heading is
the single H1. *(Caveat: if you ever build a homepage with no section-level H1,
re-introduce one — every page should have exactly one.)*

### 2. Missing meta description on description-less pages *(fixed)*
`snippets/meta-tags.liquid` only rendered `<meta name="description">` when
`page_description` was set — so collections/custom pages without a description
shipped **no** meta description, leaving Google to invent snippets. Added a
fallback to the computed `og_description` (page → shop.description → shop.name)
so every page now has one.

### 3. Organization `url` pointed at the current page *(fixed)*
The Organization JSON-LD used `request.origin | append: page.url` (the URL of
whatever page you're on) as the entity URL. Corrected to `request.origin` (the
canonical site root).

### 4. No WebSite / SearchAction schema *(added)*
Added `WebSite` + `SearchAction` structured data on the homepage
(`sections/header.liquid`), which makes the **Google sitelinks search box**
eligible and points it at the theme's search route.

### 5. Missing `og:locale` *(added)*
Added `<meta property="og:locale">` from `request.locale.iso_code` for cleaner
social/link-preview rendering.

## Structured-data status (after this PR)
- ✅ Product — Shopify `structured_data` filter (`product-information.liquid`).
- ✅ Organization — `header.liquid` (now with correct `url`).
- ✅ BreadcrumbList — product & collection (added round 1).
- ✅ WebSite + SearchAction — homepage (added this round).
- ✅ Article — blog posts (`main-blog-post.liquid`).
- ❌ **FAQPage** — still missing. Add to product/help/FAQ content for extra SERP
  real estate (high ROI, low effort).
- ⚠️ **AggregateRating** — still absent because reviews are hardcoded. A real
  review app (Loox/Judge.me) is what unlocks star ratings in Google. This remains
  the single biggest SEO *and* CRO lever.

## Still recommended (not code-fixable here)

### Crawlability / indexation (highest priority)
- **The live site returned HTTP 403 to external crawlers.** Re-confirming from
  round 1 because it dwarfs everything else: if Googlebot is being challenged by
  the WAF/Gokwik bot protection, nothing else matters. Verify in **Google Search
  Console → URL Inspection / Crawl stats** that Googlebot fetches return 200.
  Whitelist Googlebot/Bingbot if the WAF is blocking them.
- No custom `robots.txt`/`sitemap` templates exist — that's fine (Shopify serves
  sensible defaults). Don't add custom ones unless you need to.

### Image SEO
- Image rendering is centralized through `snippets/image.liquid`/`media.liquid`,
  which correctly use `image.alt`. But alt text defaults to **empty** when the
  merchant hasn't set it. **Action:** set descriptive alt text on all product
  media in the admin (e.g. "Oni Theory oversized black anime hoodie — front").
  Good for image search and accessibility.
- Define `width`/`height` on all imagery (theme largely does) to protect CLS.

### On-page / content (compounding)
- **Collection pages have no intro copy** — add 80–150 words of keyword-led copy
  per collection ("anime hoodies India", "oversized graphic hoodie") so they can
  rank, not just funnel.
- **Use the blog** (`blog.json`/`article.json` exist, unused). Target long-tail
  intent the big players ignore: "best anime hoodies in India", sizing/care
  guides, design-story lookbooks. Cheapest durable organic channel you have.
- **Internal linking** is thin — link blog → collections → products with
  descriptive, keyword-rich anchors (the new breadcrumbs help here).
- **hreflang:** you have 44 locale files, but hreflang tags only emit when
  multiple *languages are actually published* in Markets (Shopify injects them
  via `content_for_header`). If you're English-only, ignore. If you publish more
  languages later, confirm hreflang appears in the rendered `<head>`.

### Technical / performance-for-SEO
- **Add `preconnect`/`dns-prefetch`** for `cdn.shopify.com` (and any
  third-party: Gokwik, fonts, analytics) — none are currently present; this
  shaves connection latency and helps LCP, a ranking factor.
- **Core Web Vitals:** the render-blocking view transitions + always-on motion
  stack (see corrected mobile-performance section) hurt mobile LCP, which feeds
  page-experience ranking. Highest technical-SEO performance win after the 403.

## Round-2 priority order
1. **Verify Googlebot isn't 403-blocked** (GSC) — existential.
2. **Real review app → AggregateRating** (stars in SERPs) — biggest CTR lever.
3. Add **FAQPage schema** + product/collection copy — quick, compounding.
4. Set **product image alt text** in admin.
5. Add **preconnect** hints + tackle CWV (motion stack, render-blocking).
6. Activate the **blog** + internal linking for long-tail organic.

## Round-2 code changes shipped in this PR
- `sections/header.liquid`: demote homepage hidden `<h1>` → `<p>` (single H1);
  fix Organization `url`; add WebSite + SearchAction schema on homepage.
- `snippets/meta-tags.liquid`: meta-description fallback (every page gets one);
  add `og:locale`.

---

# Performance / Core Web Vitals — Round 3

A deep, code-level pass on loading behaviour and the three Core Web Vitals
(LCP, CLS, INP). As before: **fixed in this PR** vs **recommended**.

## What's already good (credit where due)
- **Scripts are non-blocking** — the importmap + per-module `fetchpriority="low"`
  `defer`/`type=module` wiring in `scripts.liquid` keeps JS off the critical
  render path. This is a strong baseline.
- **LCP element is protected by design.** The homepage hero (`oni-fx-hero`) is
  CSS/text-only (no `<img>`), so the LCP is the hero `<h1>`. `oni-motion.css`
  *deliberately* leaves the first section (the hero) un-hidden
  (`> .shopify-section:not(:first-child)`), gated behind
  `prefers-reduced-motion` with a 5s JS failsafe — so the hero paints
  immediately and is never trapped hidden waiting on JS. Nicely done.
- **CLS risk is low.** Hero uses `svh` min-height (stable), the central
  `image.liquid` sets `width`/`height`, and the decorative layers
  (haze/scanlines/petals) are absolutely positioned → no reflow.
- Fonts are `preload`ed; `base.css` uses `preload: true`.

## Fixed in this PR
### Missing CDN resource hints *(fixed)*
There were **no `preconnect`/`dns-prefetch` hints anywhere** — yet every theme
asset, product image, and webfont loads from Shopify's CDN. Added, as the first
thing in `<head>`:
- `preconnect` → `https://cdn.shopify.com` (crossorigin)
- `preconnect` → `https://fonts.shopifycdn.com` (crossorigin)
- `dns-prefetch` → `https://cdn.shopify.com` (fallback)

This warms the TLS connection in parallel with HTML parse, directly shaving
latency off the render-blocking CSS and the LCP webfont.

## Recommended (higher-risk / merchant-decision — not auto-changed)

### 1. Render-blocking view transitions — biggest available LCP win
`theme.liquid` adds `<link rel="expect" href="#MainContent" blocking="render">`
and `scripts.liquid` loads `view-transitions.js` with `blocking="render"` —
**both gated behind the `page_transition_enabled` / `transition_to_main_product`
theme settings.** When on, the browser *delays first paint* until `#MainContent`
is ready, purely for transition smoothness. On mid-range Android over mobile
data this is a direct LCP/FCP hit. **Action:** turn these settings off (at least
revisit whether the polish is worth the LCP cost on mobile). Left as a setting
toggle rather than a code edit because it's the merchant's UX call.

### 2. Three render-blocking effect stylesheets (~110KB+ uncompressed)
`stylesheets.liquid` loads `oni-fx.css` (46KB), `polly-fx.css`, and
`oni-motion.css` as plain render-blocking `stylesheet_tag`s, on top of
`base.css` (104KB).
- `oni-fx.css` *is* hero-critical (styles the LCP section) — keep it blocking.
- `oni-motion.css` must apply pre-paint to avoid FOUC — keep it blocking, but
  it's small.
- **`polly-fx.css` is the candidate to defer/scope** — confirm whether its
  styles are above-the-fold; if not, load it non-render-blocking
  (`media="print"` + `onload` swap, or `preload`+swap) or scope it to the
  templates that use it.
- Longer term: extract critical CSS and lazy-load the rest.

### 3. Always-on motion JS = INP / main-thread tax
`motion.min.js` (65KB) + `oni-motion.js` + `oni-fx.js` (38KB) + `polly-fx.js`
ship on **every** page (deferred, so not render-blocking, but they still parse,
execute, and bind scroll/observer handlers). On low-end devices this inflates
**Total Blocking Time and INP**.
- `data-oni-parallax` scroll work must be `requestAnimationFrame`-batched and use
  passive listeners (verify in `oni-fx.js`/`oni-motion.js`).
- Only load the stack on templates that actually use the effects; the homepage
  needs it, a policy page does not.
- The head script already bails on `prefers-reduced-motion` — good; make sure
  the effect *scripts* themselves also early-return so reduced-motion users
  don't pay the JS cost either.

### 4. LCP webfont priority
The heading font (which renders the LCP `<h1>`) is preloaded with
`fetchpriority="low"` (`fonts.liquid`). Consider raising the **heading** font to
default/high priority on the homepage so the LCP text isn't waiting behind
lower-priority fetches. Test both ways — it's a trade-off, not a clear win.

### 5. Total asset weight
~1.3MB of theme assets. After the wins above, audit for unused CSS/JS
(`qr-code` and the hoodie-designer are already page-scoped — good) and ship
appropriately sized hero/product imagery (Shopify's responsive `srcset` via
`image.liquid` already helps).

## Round-3 priority order
1. **Disable render-blocking page/product transitions on mobile** — biggest LCP
   win, just a settings toggle.
2. ✅ **Preconnect to Shopify CDN** — shipped this PR.
3. **Defer/scope `polly-fx.css`** and any non-critical effect CSS.
4. **Scope the motion JS** to templates that use it; confirm rAF + passive
   scroll handlers for INP.
5. **Raise heading-font priority** on the homepage (test).
6. Re-measure with PageSpeed Insights / CrUX field data and iterate.

## Round-3 code changes shipped in this PR
- `layout/theme.liquid`: add `preconnect`/`dns-prefetch` resource hints for
  `cdn.shopify.com` and `fonts.shopifycdn.com` at the top of `<head>`.

---

## Round-3b — validated against CrUX field data (mobile)

PageSpeed Insights field data (Chrome UX Report, 28-day) **confirmed the
diagnosis** and triggered the higher-impact fixes:

| Metric | Field value | Verdict |
|---|---|---|
| LCP | **5.2s** | ❌ Poor (target < 2.5s) |
| INP | **534ms** | ❌ Poor (target < 200ms) |
| CLS | **0.03** | ✅ Good (as predicted) |
| FCP | **4.0s** | ❌ Poor |
| TTFB | **1.8s** | ⚠️ Needs improvement |
| Lab Performance | **60** | — |

Live settings confirmed the culprits: `page_transition_enabled` **and**
`transition_to_main_product` were both `true`, so the render-blocking view
transition was active on every page.

### Fixes applied for LCP / FCP
1. **Removed the render-blocking view transition** — deleted the
   `<link rel="expect" href="#MainContent" blocking="render">` from
   `theme.liquid` and the `blocking="render"` on `view-transitions.js`
   (`scripts.liquid`). First paint is no longer held back waiting for
   `#MainContent`; transitions still run, they just don't block render. This is
   the single biggest FCP/LCP win.
2. **Raised the heading font (Anton) to `fetchpriority="high"`** (`fonts.liquid`)
   — it renders the hero `<h1>`, the LCP element, so it shouldn't wait behind
   low-priority fetches.
3. **Made `polly-fx.css` non-render-blocking** (`stylesheets.liquid`,
   `media="print"`/`onload` swap + `<noscript>` fallback) — its reveal states
   only apply once its deferred JS adds `.polly-fx-ready`, so it's never needed
   for first paint.
4. Plus the CDN `preconnect` hints from round 3a.

### Still outstanding — INP (534ms) needs a follow-up
INP is dominated by the always-on motion JS (`motion.min.js` 65KB +
`oni-motion.js`/`oni-fx.js`/`polly-fx.js`) executing and binding scroll/interaction
handlers on **every** page. Meaningfully fixing INP means **scoping that stack to
the templates that actually use it** and confirming scroll handlers are
`requestAnimationFrame`-batched + passive — a larger, higher-risk change held
back from this pass because it touches site-wide behaviour (e.g. product-card
tilt/zoom). Recommend doing it as a focused next step and re-measuring.

### TTFB (1.8s)
Server-side (Shopify + installed apps like Gokwik + Liquid render time), not
fixable in theme markup. Audit installed apps and reduce blocking app embeds.

### Round-3b code changes shipped in this PR
- `layout/theme.liquid`: remove render-blocking `rel="expect"` view-transition
  blocker.
- `snippets/scripts.liquid`: drop `blocking="render"` from `view-transitions.js`.
- `snippets/fonts.liquid`: heading font → `fetchpriority="high"`.
- `snippets/stylesheets.liquid`: load `polly-fx.css` non-render-blocking.
