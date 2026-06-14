# Custom Hoodie Designer (onitheory)

A step-by-step "build-a-hoodie" wizard with a live HTML5 canvas mockup.
Customers pick a color, size and placement, upload their own artwork
(drag / resize / rotate it on a front + back preview), optionally add
custom text, then add to cart. **Their full-resolution file is stored
permanently and arrives on the order as a downloadable link** — ready to
forward to PrintRow.

---

## Files added

| File | Purpose |
| --- | --- |
| `sections/oni-hoodie-designer.liquid` | The section: markup, settings + per-color mockup blocks |
| `assets/oni-hoodie-designer.css` | Dark UI, wizard, canvas, mobile styles |
| `assets/oni-hoodie-designer.js` | Wizard logic, canvas engine (drag/resize/rotate/pinch), uploads, add-to-cart |
| `templates/page.hoodie-designer.json` | A ready-made page template that renders the section |

No build step. Plain Liquid + CSS + a vanilla ES-module web component
(`<oni-hoodie-designer>`). It reuses the theme's own cart events, so the
cart drawer, cart bubble and cart page all update automatically.

---

## Setup (3 steps, ~10 min)

### 1. Create the product

In **Shopify admin → Products → Add product**:

- Title: e.g. **Custom Hoodie**
- Set your price.
- **Best option — add variants** so each color/size sells as a real
  variant (proper inventory + reporting):
  - Option 1: **Color** → `Black, White, Charcoal, Navy`
  - Option 2: **Size** → `S, M, L, XL, XXL`
  The designer auto-matches the customer's chosen Color + Size to the
  right variant.
- **Simpler option** — a single-variant product also works. Color and
  size are then saved as line item properties instead of variants.

> Tip: set the product to **"continue selling when out of stock"** if you
> print on demand, so no variant blocks checkout.

### 2. Create the page

In **Online Store → Pages → Add page**:

- Title: e.g. **Design Your Own**
- On the right, under **Theme template**, choose **`hoodie-designer`**.
- Save. Your page is now live at `/pages/design-your-own`.

### 3. Configure the section

Open the page in the **theme editor** (Customize) and select the
**Oni hoodie designer** section:

- **Custom hoodie product** → pick the product from step 1. *(Required —
  without it the preview still works but Add to cart is disabled.)*
- **Hoodie color** blocks → one per color. Set the name + swatch color.
  Optionally upload **real front/back mockup photos** per color; if left
  empty the built-in generated hoodie silhouette is used (tinted to the
  swatch color) so it works out of the box.
- **Sizes** → comma-separated (defaults to `S, M, L, XL, XXL`).
- **After add to cart** → open cart drawer / go to cart / stay.

That's it. You can also add the **Oni hoodie designer** section to *any*
page or the homepage via **Add section** in the theme editor.

---

## What you receive on the order

Open the order in **Shopify admin**. Under the line item you'll see:

- **Hoodie color** — e.g. Black
- **Size** — e.g. L
- **Print placement** — Front / Back / Front + Back
- **Design file** — a **clickable link to the customer's uploaded file at
  full resolution**. Click to download and send to PrintRow.
- **Custom text** + **Font** + **Text color** — when the customer added text

Plus two printer-only fields (hidden from the customer's cart, visible to
you in the admin — they start with `_`):

- **_Print spec** — exact placement: position %, size %, rotation for each
  printed side, e.g. `FRONT — design pos 50%,40% · size 120% · rot 0°`
- **_Mockup** — a flattened PNG preview showing how the print should look

---

## File storage options

### Shopify Files (default — no setup)

Uploads go straight to Shopify's CDN via the Cart AJAX API and attach to
the order automatically. **Recommended.** Limit is **~20 MB per file**
(that's why the size slider defaults to 20 MB).

### Cloudinary (optional — for larger files)

If you need bigger files than ~20 MB:

1. Create a free [Cloudinary](https://cloudinary.com) account.
2. Settings → **Upload** → add an **unsigned upload preset**.
3. In the section settings: set **Where to store uploads** →
   *Cloudinary*, fill in your **cloud name** + **upload preset**, and raise
   **Max file size**.

The design URL is then a Cloudinary link on the order. (Note: a single
unsigned upload is also subject to your Cloudinary plan's max image size.)

---

## Notes & troubleshooting

- **"This product is not set up yet"** on Add to cart → pick the product in
  the section settings.
- **A size/color won't add** → that variant is sold out. Enable "continue
  selling when out of stock" or restock.
- **Custom fonts** → four are bundled (Anton, Bebas Neue, Permanent Marker,
  Orbitron). To change them, edit the `font_labels` / `font_stacks` arrays
  at the top of `sections/oni-hoodie-designer.liquid` and the matching
  `<link>` to Google Fonts.
- **Print area / mockup tuning** → the dashed print box and silhouette live
  in `assets/oni-hoodie-designer.js` (`PRINT` constant and `#drawHoodie`).
- The designer never touches checkout pages and respects
  `prefers-reduced-motion`.
