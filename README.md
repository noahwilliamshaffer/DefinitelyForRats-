# DEFINITELY FOR RATS — research peptide storefront

A storefront for one research peptide line and two lab supplies, written
entirely in terms of what each product does for your rat. Plain static site
(HTML + CSS + vanilla JS) — no build step, no dependencies, deploys anywhere
(GitHub Pages, Netlify, Vercel, any host).

The whole map:

- **`index.html`** — hero → disclaimer strip → three product cards → footer.
  Every card carries a price range and a **Select options** button.
- **`retatrutide.html`**, **`bacteriostatic-water.html`**,
  **`insulin-syringes.html`** — one product page per catalogue item: gallery,
  buy box with option pills, Add to cart and Buy now, numbered
  handling/storage sections, and detail tabs. All three are the same template,
  driven by `<body data-product="…">`.
- **`checkout.html`** — the cart.

Checkout is one hosted payment page for the whole cart — Authorize.net, via a
high-risk merchant processor (see below). A 21+ age gate shows once per session
and carries across both pages.

## Design

International Typographic Style played straight: warm paper, near-black ink,
and a single safety-orange accent used only for prices, primary buttons, and
focus rings. Space Grotesk for text, IBM Plex Mono for prices and technical
labels. One 4px spacing scale, a 1200px container, hairline rules, and a
barely-there ruled-paper background. The copy is the joke; the design is not
in on it.

## Project structure

```
.
├── index.html              # main page: hero, disclaimer, product grid
├── retatrutide.html        # product page  ┐
├── bacteriostatic-water.html  #            ├ same template, data-product
├── insulin-syringes.html   # product page  ┘
├── checkout.html           # the cart page
├── css/styles.css          # all styling (tokens at the top)
├── js/
│   ├── site-config.js      # ⭐ branding, disclaimer, age gate, checkout mode
│   ├── products.js         # ⭐ catalog: products, variants, page content
│   ├── payment-links.js    # generated variant-id → Stripe link map
│   ├── main.js             # window.RATS helpers, product grid, age gate
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
`payment-links` → `main` → `product-page`.

## Editing the catalog

Everything on every page derives from `js/products.js`. Each product has
`variants` — separately purchasable amounts, each with its own id, label,
price, and Stripe Payment Link. A product with an `href` gets a product page
and a **Select options** button on its card; a product without one would be
bought directly from its card instead. All three currently have one.

Products with a page also carry `images`, `spec`, `notes` (the numbered 01-04
accordions), `trust`, and `detail`. Add a variant object and re-run the
generator below; pills, price, and buy links follow automatically.

To add a product: add its entry with an `href`, copy any existing product page
to that filename, and change `<body data-product="…">`, the `<title>`, and the
meta description. Nothing else is per-product.

## Generate the Stripe Payment Links

Each variant checks out through its own Stripe-hosted Payment Link, with
adjustable quantity enabled so the buyer can change quantity on Stripe's page
(the site itself ships no quantity stepper). The generator creates one link per
variant and writes the id → URL map to `js/payment-links.js` (public URLs, safe
to commit). Requires **Node 18+**; no `npm install`.

```powershell
$env:STRIPE_SECRET_KEY="sk_test_your_key"; node scripts/create-stripe-payment-links.mjs
```

```bash
STRIPE_SECRET_KEY=sk_test_your_key node scripts/create-stripe-payment-links.mjs
```

Then commit and push `js/payment-links.js` — the Buy buttons go live. Notes:

- Your **secret key** is read from the environment for that one command and is
  used only to call Stripe from your machine. It is **never** written to a file
  or committed.
- Re-running reuses existing links and only creates new ones. Delete an entry
  from `js/payment-links.js` to regenerate it.
- Run with `sk_test_` first to verify, then re-run with `sk_live_` for real
  checkout. **Variants without a link render as a disabled button**, never as a
  control that goes nowhere.

> ⚠️ **Never commit a secret key.** Only public `buy.stripe.com` URLs belong in
> this repo — every `js/` file ships to the browser.

> ⚠️ **Processor eligibility.** Stripe, PayPal, and Square classify research
> peptides / "research chemicals" as **restricted or prohibited** under their
> acceptable-use policies. Confirm your business is eligible (or use a
> high-risk merchant processor) before relying on this — accounts can be
> frozen otherwise.

## Deploy to GitHub Pages

`.github/workflows/deploy-pages.yml` publishes the site on every push to
`main` (repo **Settings → Pages → Source: GitHub Actions**, one-time).

## Compliance

Products are described for laboratory rodent research only. The disclaimer
appears twice on every page — under the hero (or in the product page's notice
callout) and in the footer — at ≥12px and ≥4.5:1 contrast, never collapsed or
hover-hidden. Effect copy stays about the rat: no human-use claims, dosing,
timeframes, percentages, or testimonials. The 21+ age gate is load-bearing.
Get a compliance/legal review before accepting live payments.

## Checking work

No test runner. Verify with syntax checks:

```bash
node --check js/products.js && node --check js/site-config.js && node --check js/main.js && node --check js/product-page.js
```

For visual checks, open `index.html` directly — no server needed — or serve the
folder:

```bash
python -m http.server 8000
```
