# DEFINITELY FOR RATS — one-page storefront

Static single-page site: plain HTML + CSS + vanilla JS. **No build step, no
dependencies, no package.json, no test suite.** Deploys as-is to GitHub Pages
via `.github/workflows/deploy-pages.yml` on push to `main`.

The whole site is `index.html`: hero → disclaimer strip → three product cards →
footer. The joke and the compliance posture are the same sentence — every
product is described in terms of what it does for the buyer's rat, with a
straight face. Keep the copy deadpan; never let it wink at the reader.

## Where things live

| Path | What it is |
|---|---|
| `js/site-config.js` | `window.SITE` — brand, disclaimer, age gate, payment provider. **Single source of truth**; rebranding happens here only. |
| `js/products.js` | `window.PRODUCTS` — the catalog. Fields: `id, name, tagline, copy, variants[]`; each variant: `id, label, price, buyUrl?`. |
| `js/payment-links.js` | `window.PAYMENT_LINKS` — **generated** variant-id → Stripe link map, do not hand-edit. Written by `scripts/create-stripe-payment-links.mjs`. |
| `js/main.js` | Renders product cards into `#product-grid`, variant dropdown ↔ price/Buy-link sync, age gate. |
| `css/styles.css` | All styling. CSS variables at the top. |

The old multi-page APEX PEPTIDES site (about/peptides/wholesale/contact/coa,
`js/components.js`, the Rat Pack mascot section) was removed in the one-page
rebuild — it's all in git history if ever needed.

## Conventions

- Scripts attach to `window.*` globals via plain `<script>` tags. No module
  system — don't introduce `import`/`export` in `js/`.
- Load order matters: `site-config.js` → `products.js` → `payment-links.js` →
  `main.js`.
- Adding a product/variant means editing `window.PRODUCTS` and re-running the
  link generator. Don't hardcode product markup into HTML.

## Checking work

No test runner. Verify with syntax checks:

```bash
node --check js/products.js && node --check js/site-config.js && node --check js/main.js
```

For visual checks, open `index.html` directly — no server needed.

## Hard rules

- **Never commit a Stripe secret key** (`sk_...`). It lives only in the
  `STRIPE_SECRET_KEY` env var when running the generator. Every `js/` file
  ships to the browser.
- Product copy is research-use framing. Effect sentences stay about THE RAT —
  no "you"/"your results", no percentages, timeframes, dosing, or
  testimonials. "Often stacked with" (descriptive) is allowed; "works better
  together" (a claim) is not.
- The disclaimer appears twice (under hero, in footer), minimum 12px at
  ≥4.5:1 contrast, never collapsed or hover-hidden. Keep the 21+ age gate.
- Prices and copy are intentional — don't "improve" or restore them without
  being asked.
