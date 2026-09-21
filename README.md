# Verity Research Labs — research peptide storefront

A clinical storefront for research peptides — retatrutide today, with room to
grow — plus two laboratory supplies. Written to pass a high-risk merchant
processor's website underwriting. Plain static site (HTML + CSS + vanilla JS),
no build step, no dependencies; checkout runs as serverless functions, so it
deploys to **Vercel or Netlify**.

The whole map:

- **`index.html`** — hero → research notice → product cards → "Our standards".
- **`retatrutide.html`**, **`bacteriostatic-water.html`**,
  **`lab-syringes.html`** — one product page per catalogue item, all the same
  template driven by `<body data-product="…">`.
- **`about.html`**, **`coa.html`**, **`contact.html`** — company, certificates
  of analysis, customer service.
- **`terms.html`**, **`refunds.html`**, **`shipping.html`**, **`privacy.html`**
  — policy templates. **Have a lawyer review them before going live.**
- **`checkout.html`** — the cart.

Checkout is one hosted payment page for the whole cart — Authorize.net, via a
high-risk merchant processor (see below). A 21+ age gate shows once per
session.

## Before applying to a processor

1. Fill in every `[bracketed]` value in `js/site-config.js`: brand, legal
   name, phone, email, hours, business address, governing-law state, and the
   processing/return-window figures. They must match the merchant application.
2. The brand is Verity Research Labs (`verityresearchlabs.com`). If it ever
   changes: `brand` in `js/site-config.js`, then find-and-replace across
   `*.html` (the no-script fallback text).
3. Add a certificate of analysis for each product: put the PDF in
   `assets/coa/` and set `coa: { batch, date, file }` on the product in
   `js/products.js`. Certificates must be under 15 months old.
4. Confirm the retatrutide identifiers in the spec table against the COA.
5. Have the four policy pages reviewed.

## Design

International Typographic Style: warm paper, near-black ink, and a single
safety-orange accent used only for prices, primary buttons, and focus rings.
Space Grotesk for text, IBM Plex Mono for prices and technical labels. One 4px
spacing scale, a 1200px container, hairline rules.

## Project structure

```
.
├── index.html              # main page: hero, notice, product grid, standards
├── retatrutide.html        # product page  ┐
├── bacteriostatic-water.html  #            ├ same template, data-product
├── lab-syringes.html       # product page  ┘
├── about.html · coa.html · contact.html
├── terms.html · refunds.html · shipping.html · privacy.html
├── checkout.html           # the cart page
├── css/styles.css          # all styling (tokens at the top)
├── js/
│   ├── site-config.js      # ⭐ brand, contact details, disclaimers, checkout mode
│   ├── products.js         # ⭐ catalog: products, variants, page content
│   ├── payment-links.js    # generated variant-id → Stripe link map
│   ├── main.js             # window.STORE helpers, config stamping, grid, COA table, age gate
│   ├── product-page.js     # gallery, buy box, accordions, tabs
│   └── cart.js             # cart state, Add to cart, checkout page
├── api/
│   ├── authorize-net-checkout.js    # serverless checkout — Authorize.net (active)
│   ├── create-checkout-session.js   # serverless checkout — Stripe (inactive)
│   └── _catalog.js                  # shared price lookup for both
├── assets/                 # favicon + monochrome product renderings (SVG)
└── scripts/create-stripe-payment-links.mjs
```

## Cart and checkout

Each product page has **Add to cart** beside **Buy now**. Both route through the
cart — Buy now adds the selected variant and goes straight to `checkout.html` —
so a buyer always pays for the whole order in one place. The cart lives in
`localStorage`, survives refreshes, shows a count in the topbar on every page,
and opens as a full page with quantity steppers, per-line removal, and a
subtotal. Checkout has two modes:

**Authorize.net (active).** Stripe, PayPal, Square and Shopify Payments all
prohibit research peptides, so the store takes cards through a **high-risk
merchant processor** that underwrites this category knowingly, on the
Authorize.net gateway most of them board onto. Apply with an accurate
description of what is sold — a processor that approves you knowing the
catalogue will not freeze you for it later.

1. Get Authorize.net credentials — a free sandbox account at
   developer.authorize.net to test, then the live account your processor sets
   up. Both are under **Account → Settings → API Credentials & Keys**.
2. Deploy to Vercel or Netlify and set, in that host's environment:
   `AUTHNET_API_LOGIN_ID`, `AUTHNET_TRANSACTION_KEY`, and `AUTHNET_ENV`
   (`sandbox` or `production`).
3. In the Authorize.net merchant interface, turn on **Email Receipt** so the
   buyer gets the receipt the confirmation message promises.

The cart POSTs to `api/authorize-net-checkout.js`, which recomputes every price
from `js/products.js` — it never trusts a price from the browser — and gets a
one-time token. The cart form-POSTs that token to Authorize.net's hosted page,
where the buyer enters card, billing and shipping details; no card data touches
this site. Afterwards Authorize.net returns to `checkout.html?checkout=success`
(cart emptied, confirmation shown) or `?checkout=cancelled` (cart untouched).

If checkout cannot start, the buyer sees a plain "try again" message with their
cart intact — never a raw error, and never a detour to a Stripe link.

**Stripe (inactive).** Set `provider: "stripe"` and
`checkoutEndpoint: "/api/create-checkout-session"` in `js/site-config.js` to
switch back. That mode falls back to the per-variant Payment Links in
`js/payment-links.js` (quantity 1 each) when its endpoint is unreachable.

GitHub Pages cannot run functions, so checkout needs Vercel or Netlify.

Scripts attach to `window.*` globals via plain `<script>` tags — there is no
module system. Load order matters: `site-config` → `products` →
`payment-links` → `main` → `product-page` → `cart`.

The header and footer are repeated in every HTML file — there is no build
step to include them — so a change to either goes into all twelve.

## Editing the catalog

Everything on every page derives from `js/products.js`. Each product has
`variants` — separately purchasable amounts, each with its own id, label,
price, and Stripe Payment Link. A product with an `href` gets a product page
and a **Select options** button on its card; a product without one would be
bought directly from its card instead. All three currently have one.

Products with a page also carry `images`, `spec`, `notes` (the numbered 01-04
accordions), `trust`, and `detail`. Add a variant object and re-run the
generator below; pills, price, and buy links follow automatically.

To add a product: add its entry with an `href` and `coa`, copy any existing
product page to that filename, change `<body data-product="…">`, the
`<title>`, and the meta description, and add it to the footer's Shop column in
every page.

## Stripe Payment Links (inactive)

`scripts/create-stripe-payment-links.mjs` generates `js/payment-links.js`,
used only when `provider` is `"stripe"`. Stripe prohibits research peptides, so
this path is kept for reference, not for use.

## Compliance

Written to the processor's website checklist: scientific, technical copy only
— no health or outcome claims, dosing, protocols, stacks, or testimonials. The
per-product research notice appears on every product, and every footer carries
the research-use and FDA disclaimers, at ≥12px and ≥4.5:1 contrast, never
collapsed or hover-hidden. The 21+ age gate is load-bearing. See CLAUDE.md for
the full rule list. Get a compliance/legal review before accepting live
payments.

## Checking work

No test runner. Verify with syntax checks:

```bash
for f in js/*.js api/*.js; do node --check "$f"; done
```

For visual checks, serve the folder and open `index.html`:

```bash
python3 -m http.server 8000
```
