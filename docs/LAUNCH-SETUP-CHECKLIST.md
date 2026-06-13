# Oni Theory — Launch Setup Checklist (owner actions)

These are the conversion levers I can't do via API — they need you in Shopify admin
or external dashboards. Ordered by impact while Meta ads are live. Check off as you go.

## 🔴 0. Conversion tracking (DO TODAY — ads are blind without it)
- [ ] Shopify admin → **Settings → Apps and sales channels → Facebook & Instagram**
      (Meta channel). Connect your Meta Business account + Pixel.
- [ ] Turn on **Conversions API** (in the Meta channel / Events Manager) — improves
      tracking past iOS/ad-blockers. This is what makes your ad spend optimisable.
- [ ] Add **GA4**: Settings → Customer events, or the Google & YouTube channel.
- [ ] TEST: install the **Meta Pixel Helper** Chrome extension, visit the store, add
      to cart, start checkout — confirm PageView, ViewContent, AddToCart, InitiateCheckout
      fire. In Meta Events Manager, confirm Purchase events arrive (use a real test order).
- [ ] In Meta Ads Manager, set the campaign to optimise for **Purchase** (not clicks/
      traffic) once Purchase events are confirmed flowing.

## 🟠 1. Free-shipping rate (match the new message I set)
- [ ] Settings → **Shipping and delivery** → add a rate: **Free over ₹1,499**.
      (The theme now SAYS ₹1,499 — the actual rule must match or it misleads buyers.)

## 🟠 2. Product reviews (biggest trust lever; theme is already wired for it)
- [ ] Install **Judge.me** (free plan) from the Shopify App Store.
- [ ] It writes to the `reviews.rating` / `reviews.rating_count` metafields — the PDP
      star block + product-card stars + Google rich snippets I added will then show.
- [ ] Seed **5–10 honest reviews** (early customers, friends who actually bought,
      or import) so PDPs aren't at zero. Add 1–2 photos per review if possible.

## 🟠 3. COD with guardrails (India conversion booster — you asked for advice)
- [ ] Settings → Payments → enable **Cash on Delivery** (manual payment method).
- [ ] Add a **COD fee ~₹50** and/or a **prepaid incentive** (e.g. "Pay online & save
      ₹50 / free shipping") to push prepaid and offset RTO.
- [ ] Because you're **print-on-demand**, a rejected COD = you already paid to print it.
      Install an RTO/OTP-verification app (**GoKwik / Shipway / PhonePe**) to confirm
      COD orders and cut fakes. Confirm **Printrove** handles COD reconciliation + RTO.
- [ ] Optional: COD only above a min order value (e.g. ₹999).

## 🟡 4. Email/SMS recovery (recovers paid clicks that didn't buy)
- [ ] Shopify **Email** (free) or **Klaviyo** (free tier): turn on
      **Abandoned checkout** + **Welcome** automations.
- [ ] Add a **first-order popup** (email capture → ONI10) — Shopify Forms (free) or
      the reviews/email app. Theme has inline signup but no popup.

## 🟡 5. Product images (the on-site conversion killer)
- [ ] New products KOI / JIGOKU / FŪJIN are in **Draft** with no images.
- [ ] Download the art I generated (Higgsfield library + the Canva designs) and the
      4 hoodie editorial shots, then upload to each product → set as featured →
      switch product to **Active**. (Sandbox can't push images to Shopify directly.)

## 🟢 6. Ad efficiency (since ads are spending)
- [ ] Point ad links at a **collection or PDP** (Drop 002 / best SKU), not the homepage.
- [ ] Use the Canva launch post + Higgsfield art as ad creative; test a UGC-style video.
- [ ] Once Pixel + CAPI verified: turn on **retargeting** (cart/PDP abandoners) and
      add a **Meta product catalog** for Advantage+ / dynamic product ads.

## Already done in code/store (no action needed)
- Category pricing + compare-at, inventory unblocked, SKU-map fix.
- Collections (Drop 002/003, Gaming, Under ₹999, New Arrivals) + homepage.
- SEO titles + meta on all 36 products. Size-guide / shipping / story pages.
- Discounts ONI10 + YOKAI15 (timed). Trust badges + PDP size-guide/star block +
  ₹1,499 free-ship messaging (this branch — deploy the theme to go live).
