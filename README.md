# APEX PEPTIDES — Research Peptides Storefront

A clean, responsive multi-page storefront template for a research-compound
business. Built as a plain static site (HTML + CSS + vanilla JS) — no build step,
no dependencies, and it deploys anywhere (GitHub Pages, Netlify, Vercel, any host).

The layout, page set, and UX are modeled on a typical research-peptide store:
announcement bar, sticky header, hero, feature strip, product grids, category
tiles, best-sellers, an age-verification gate, and a compliance-focused footer.

> **Placeholder branding & content.** This is a starter template. The brand name
> ("APEX PEPTIDES"), product listings, prices, and copy are **placeholders** —
> not affiliated with any real company — and are meant to be replaced with your
> own. See **Rebranding** below.

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Home — hero, features, featured products, categories, best sellers |
| `about.html` | Our Company — mission, quality, compliance, support |
| `peptides.html` | Buy Peptides — full peptide catalog grid |
| `aminos.html` | Buy Aminos — amino-acid products |
| `accessories.html` | Accessories — reconstitution & lab supplies |
| `wholesale.html` | Wholesale — bulk program + quote request form |
| `contact.html` | Contact — contact info + message form |
| `coa.html` | Certificates of Analysis — test-report lookup + table |

## Project structure

```
.
├── index.html, about.html, … (page templates)
├── css/
│   └── styles.css          # all styling (CSS variables at the top)
├── js/
│   ├── site-config.js      # ⭐ branding, nav, footer, disclaimer — edit here
│   ├── products.js         # ⭐ product catalog data — edit here
│   ├── components.js       # renders shared header/footer/age-gate from config
│   └── main.js             # renders product grids + UI interactions
└── assets/
    └── favicon.svg
```

## Rebranding (one place)

Open **`js/site-config.js`** and change the values in the `SITE` object — the
`brand`, `tagline`, `email`, shipping thresholds, navigation, and footer links
all flow from there into every page automatically. Page `<title>` tags live in
each HTML file's `<head>`.

To swap the catalog, edit **`js/products.js`** — each entry controls a product
card (name, category, price, sale price, stock, blurb).

## Deploy to GitHub Pages

A workflow is included at `.github/workflows/deploy-pages.yml` that publishes the
site on every push to `main`. One-time setup:

1. In the repo, go to **Settings → Pages → Build and deployment**.
2. Set **Source** to **GitHub Actions**.

The next push (or a manual run from the Actions tab) deploys the site to
`https://noahwilliamshaffer.github.io/peptides/`.

## Wire up the forms (no backend needed)

The Contact and Wholesale forms POST to an email service you choose. Pick one,
paste your value into `js/site-config.js`, and you'll receive submissions by email:

- **Formspree** — create a form at [formspree.io](https://formspree.io), then set
  `formEndpoint: "https://formspree.io/f/XXXXXXXX"`.
- **Web3Forms** — get a free access key at [web3forms.com](https://web3forms.com),
  then set `formEndpoint: "https://api.web3forms.com/submit"` and
  `formAccessKey: "your-access-key"`.

Leave `formEndpoint` empty to keep the forms in harmless demo mode.

## Payments (real checkout, no backend)

Payment code is fully wired — you only supply your own account's **public** key.
Set the provider in `js/site-config.js` under `payment`.

> ⚠️ **Never commit a secret key.** Only publishable keys, payment-link URLs, and
> Snipcart's *public* API key belong in `site-config.js` — that file ships to the
> browser. A Stripe secret key (`sk_...`) must never go in this repo.

> ⚠️ **Processor eligibility.** Stripe, PayPal, and Square classify research
> peptides / "research chemicals" as **restricted or prohibited** under their
> acceptable-use policies. Confirm your business is eligible (or use a high-risk
> merchant processor) before relying on this — accounts can be frozen otherwise.

### Option A — Stripe Payment Links (simplest)

Each product links to its own Stripe-hosted checkout page.

1. Create a Stripe account and complete verification at
   [dashboard.stripe.com](https://dashboard.stripe.com) *(your account — I can't
   create it or complete identity/bank verification for you)*.
2. For each product, create a **Payment Link**
   (dashboard.stripe.com/payment-links).
3. In `js/site-config.js` set `payment.provider: "stripe"`.
4. In `js/products.js`, paste each link into that product's `buyUrl`.

Stripe hosts the entire checkout and handles PCI — nothing sensitive touches this site.

#### Generate all Payment Links at once (recommended)

Instead of creating 60+ links by hand, run the included generator. It creates a
Payment Link for every product in `js/products.js` and writes the
id → URL map to `js/payment-links.js` (which the Buy Now buttons read
automatically). Requires **Node 18+**; no `npm install`.

```powershell
# PowerShell (Windows)
$env:STRIPE_SECRET_KEY="sk_test_your_key"; node scripts/create-stripe-payment-links.mjs
```

```bash
# bash / zsh
STRIPE_SECRET_KEY=sk_test_your_key node scripts/create-stripe-payment-links.mjs
```

Then `git add js/payment-links.js && git commit && git push` — every Buy Now
button goes live. Notes:

- Your **secret key** is read from the environment for that one command and is
  used only to call Stripe from your machine. It is **never** written to a file
  or committed. `js/payment-links.js` contains only public `buy.stripe.com` URLs.
- Re-running reuses existing links and only creates new ones (e.g. after you add
  products). Delete an entry from `js/payment-links.js` to regenerate it.
- Run it with an `sk_test_` key first to verify, then re-run with your `sk_live_`
  key (after your account is approved) for real checkout.

### Option B — Snipcart (full cart + checkout)

Keeps the on-site cart experience; Snipcart runs the checkout.

1. Create a [Snipcart](https://snipcart.com) account and connect your payment
   gateway (Stripe/PayPal/etc.) in their dashboard.
2. Copy your **Public API Key**.
3. In `js/site-config.js` set `payment.provider: "snipcart"` and
   `payment.snipcartKey: "your-public-key"`.

The "Add to Cart" buttons and header cart become live automatically. Snipcart
validates prices by crawling your deployed product pages, so deploy first
(GitHub Pages), then test in their **Test** mode before going live.

## Notes

- **Still demo-only:** the product search and COA lookup are front-end stubs.
- Set `payment.provider` back to `"none"` any time to disable real checkout.
- **Research use only.** The site includes a 21+ age gate and research-only
  disclaimers consistent with this product category. Confirm the legal and
  compliance requirements for your jurisdiction before selling anything.

## Run locally

Just open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000
