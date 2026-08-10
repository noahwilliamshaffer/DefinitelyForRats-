# DEFINITELY FOR RATS — one-page storefront

A single-page storefront for one research peptide line and two lab supplies,
written entirely in terms of what each product does for your rat. Plain static
site (HTML + CSS + vanilla JS) — no build step, no dependencies, deploys
anywhere (GitHub Pages, Netlify, Vercel, any host).

One page, one scroll: hero → disclaimer → three product cards (amount dropdown,
live price, one Buy button per card) → footer disclaimer. A 21+ age gate shows
once per session.

## Project structure

```
.
├── index.html              # the entire site
├── css/styles.css          # all styling (CSS variables at the top)
├── js/
│   ├── site-config.js      # ⭐ branding, disclaimer, age gate, checkout — edit here
│   ├── products.js         # ⭐ catalog: products + variants — edit here
│   ├── payment-links.js    # generated variant-id → Stripe link map
│   ├── main.js             # renders cards, variant switching, age gate
│   └── cart.js             # cart state, drawer, checkout handoff
├── api/
│   └── create-checkout-session.js   # serverless multi-item Stripe Checkout
├── assets/                 # favicon + product illustrations
└── scripts/create-stripe-payment-links.mjs
```

## Cart & checkout

Every variant has an **Add to cart** button. The cart lives in `localStorage`,
survives refreshes, and opens in a drawer with quantity controls and a running
subtotal. There are two ways it can take payment:

**Mode A — multi-item checkout (recommended).** One payment for the whole cart.
Deploy this repo to Vercel or Netlify, set `STRIPE_SECRET_KEY` in that host's
environment variables, then set in `js/site-config.js`:

```js
payment: { checkoutEndpoint: "/api/create-checkout-session" }
```

The cart POSTs to `api/create-checkout-session.js`, which recomputes every
price server-side from `js/products.js` (it never trusts a price from the
browser), creates a Stripe Checkout Session, and redirects the customer to
Stripe's hosted page. The secret key stays in the host's environment — it is
never committed and never reaches the browser.

**Mode B — hosted Payment Links (no backend).** Leave `checkoutEndpoint` empty
and run the generator below. Each variant gets its own `buy.stripe.com` page,
and a **Buy now** button appears beside Add to cart. This pays for one product
at a time; a multi-item cart offers a Pay button per line.

After payment Stripe returns to `/?checkout=success`, which empties the cart and
shows a confirmation; `/?checkout=cancelled` leaves the cart untouched.

## Editing the catalog

Everything on the page derives from `js/products.js`. Each product has
`variants` — separately purchasable amounts, each with its own id, label,
price, and Stripe Payment Link. Add a variant object and re-run the generator
below; the dropdown, price, and Buy button follow automatically.

## Generate the Stripe Payment Links

Each variant checks out through its own Stripe-hosted Payment Link. The
generator creates one link per variant and writes the id → URL map to
`js/payment-links.js` (public URLs, safe to commit). Requires **Node 18+**;
no `npm install`.

```powershell
# PowerShell (Windows)
$env:STRIPE_SECRET_KEY="sk_test_your_key"; node scripts/create-stripe-payment-links.mjs
```

```bash
# bash / zsh
STRIPE_SECRET_KEY=sk_test_your_key node scripts/create-stripe-payment-links.mjs
```

Then commit and push `js/payment-links.js` — the Buy buttons go live. Notes:

- Your **secret key** is read from the environment for that one command and is
  used only to call Stripe from your machine. It is **never** written to a file
  or committed.
- Re-running reuses existing links and only creates new ones. Delete an entry
  from `js/payment-links.js` to regenerate it.
- Run with `sk_test_` first to verify, then re-run with `sk_live_` for real
  checkout. Buttons without a link render disabled.

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
appears under the hero and in the footer, effect copy stays about the rat (no
human-use claims, dosing, timeframes, or testimonials), and the 21+ age gate
is load-bearing. Get a compliance/legal review before accepting live payments.

## Run locally

Just open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000
