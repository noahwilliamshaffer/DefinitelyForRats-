# DEFINITELY FOR RATS — research peptide storefront

A storefront for one research peptide line and two lab supplies, written
entirely in terms of what each product does for your rat. Plain static site
(HTML + CSS + vanilla JS) — no build step, no dependencies, deploys anywhere
(GitHub Pages, Netlify, Vercel, any host).

Two pages, and that is the whole map:

- **`index.html`** — hero → disclaimer strip → three product cards → footer.
  Bacteriostatic water and syringes are bought straight from their cards.
- **`retatrutide.html`** — the peptide's product page: gallery, buy box with
  option pills, numbered handling/storage sections, and detail tabs.

Checkout is a Stripe-hosted Payment Link per variant. A 21+ age gate shows once
per session and carries across both pages.

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
├── retatrutide.html        # the one product page
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
│   └── create-checkout-session.js   # serverless multi-item Stripe Checkout
├── assets/                 # favicon + monochrome product renderings (SVG)
└── scripts/create-stripe-payment-links.mjs
```

## Cart and checkout

Every purchasable variant has **Add to cart** beside **Buy**. The cart lives in
`localStorage`, survives refreshes, shows a count in the topbar on every page,
and opens as a full page at `checkout.html` with quantity steppers, per-line
removal, and a subtotal. Checkout has two modes:

**Mode A — one payment for the whole cart (recommended).** Deploy to Vercel or
Netlify, set `STRIPE_SECRET_KEY` in that host's environment, then set in
`js/site-config.js`:

```js
payment: { checkoutEndpoint: "/api/create-checkout-session" }
```

The cart POSTs to `api/create-checkout-session.js`, which recomputes every
price server-side from `js/products.js` — it never trusts a price from the
browser — creates a Stripe Checkout Session, and redirects to Stripe's hosted
page. The secret key stays in the host's environment.

**Mode B — hosted Payment Links (no backend).** Leave `checkoutEndpoint` empty.
This is the only mode that works on **GitHub Pages, which cannot run
functions.** Each cart line gets its own Pay button. Note that a Payment Link
always opens at **quantity 1** — the cart's quantity does not carry across, so
these buttons deliberately show no line total, and the buyer sets quantity on
Stripe's page (adjustable quantity is enabled on every link).

After payment Stripe returns to `/?checkout=success`, which empties the cart and
confirms; `/?checkout=cancelled` leaves the cart untouched.

Scripts attach to `window.*` globals via plain `<script>` tags — there is no
module system. Load order matters: `site-config` → `products` →
`payment-links` → `main` → `product-page`.

## Editing the catalog

Everything on both pages derives from `js/products.js`. Each product has
`variants` — separately purchasable amounts, each with its own id, label,
price, and Stripe Payment Link. A product with an `href` gets a product page
and a **Select options** button on its card; a product without one is bought
directly from the card with a **Buy** button.

Products with a page also carry `images`, `spec`, `notes` (the numbered 01-04
accordions), `trust`, and `detail`. Add a variant object and re-run the
generator below; pills, price, and buy links follow automatically.

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
