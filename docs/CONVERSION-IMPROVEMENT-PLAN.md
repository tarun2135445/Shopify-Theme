# Oni Theory — Conversion Improvement Plan v2

**Goal:** Raise conversion rate from ~0% toward 1.5–2.5% (India apparel benchmark).
**Context:** Meta ads are LIVE and paying for traffic, but the store converts ~0%
(150 sessions, 0 real orders — the 3 refunds were owner tests). Paid clicks are
landing on a store that can't close them. This plan plugs the leaks in
money-losing order. Priority = **Conversion**. Theme = Horizon v3.5.1 (most CRO
features already exist in code; they're just unwired or starved of data).

---

## PHASE 0 — STOP THE BLEED (this week, critical)

1. **Conversion tracking — DO FIRST.** Theme has NO pixel in code
   (`layout/theme.liquid` relies on `{{ content_for_header }}`). If the Meta Pixel +
   Conversions API aren't installed via the Meta sales channel, the live ads are
   optimizing blind and retargeting is impossible.
   - Install/verify Meta Pixel + CAPI (Facebook & Instagram channel).
   - Add GA4. Confirm Shopify "Customer events" / web pixel fires Purchase.
   - Verify with Meta Pixel Helper + a test checkout.
2. **Real product imagery.** Biggest on-site conversion killer. New products
   (KOI, JIGOKU, FŪJIN) have NO images → in Draft. Flat Drop 001/002 art looks
   amateur. Fix the image pipeline (sandbox can't bridge Higgsfield/Canva→Shopify):
   download generated art locally → upload to Shopify → set featured. Activate the
   3 drafts once they have images.
3. **Free-shipping threshold sanity.** Announcement bar says "Free shipping over
   ₹2,999" but tee AOV ≈ ₹799 and hoodie ≈ ₹1,499 — almost no one hits ₹2,999.
   Lower to ~₹1,499 (1 hoodie or 2 tees) so it actually drives basket size.

## PHASE 1 — TRUST (cold paid traffic = high skepticism on a brand-new store)

4. **Product reviews.** Install Judge.me (free tier) or Shopify reviews. The theme
   already has `blocks/review.liquid` (reads `reviews.rating` metafield) + PDP
   JSON-LD — installing a review app lights up star ratings on cards, PDP, and
   Google rich snippets. Seed 5–10 honest early reviews. Highest-ROI trust lever.
5. **Trust badges.** `blocks/payment-icons.liquid` exists but is NOT deployed in
   the footer. Add it. Add a trust row near add-to-cart: Secure Checkout · Easy
   Returns · Made-to-order in India.
6. **Link the Size Guide** (page already created at `/pages/size-guide`) from every
   PDP — cuts size anxiety and returns.
7. **COD with guardrails (recommended for India).** See "COD advice" below.

## PHASE 2 — CONVERSION MECHANICS

8. **Email/SMS flows:** abandoned-cart + welcome (Shopify Email free, or Klaviyo).
   Recovers paid clicks that didn't buy.
9. **First-order popup** (email capture + ONI10). Theme has inline email-signup but
   no popup capture.
10. **Free-shipping progress bar** in the cart drawer (theme gap) — "₹X to free
    shipping" lifts AOV.
11. **Bundles to lift AOV:** "Buy 2 tees", "hoodie + matching tee" combo.
12. **Cart/PDP upsell:** offer accessories (stickers/keychain/cap) as add-ons.

## PHASE 3 — AD EFFICIENCY (ads are already spending)

13. **Send ads to a collection/PDP, not the homepage** (Drop 002/003 or best SKU).
14. **Use the Higgsfield/Canva assets as ad creative;** test UGC-style video.
15. **Retargeting** cart/PDP abandoners (unlocked once Pixel+CAPI from Phase 0 work).
16. **Meta product catalog feed** → Advantage+ Shopping / dynamic product ads.

---

## COD ADVICE (asked: "not sure")
Recommend **enabling COD** — India cold/Meta traffic converts 2–3× better with it —
BUT print-on-demand makes RTO (return-to-origin) expensive (item already printed).
Guardrails:
- Nudge prepaid: small prepaid-only discount or free shipping; add a flat COD fee (~₹50).
- Add address/OTP confirmation (apps: GoKwik / Shipway / PhonePe) to cut fake COD orders.
- Confirm Printrove COD reconciliation + RTO handling before enabling.
- Optionally COD only above a min order value.

## MEASUREMENT
- Primary: conversion rate (target 1.5–2.5%), ROAS, AOV.
- Funnel: sessions → cart adds → reached checkout → purchased (ShopifyQL).
- Review weekly; kill ad creatives/audiences with no Purchase events.

## KNOWN BLOCKER
Sandbox has no internet egress + Shopify can't hotlink Higgsfield/Canva CDNs, so
images can't be pushed from here. Image steps need the user to download→upload, or a
session/environment with egress.
