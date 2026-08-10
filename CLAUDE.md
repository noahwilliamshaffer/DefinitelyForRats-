# APEX PEPTIDES — storefront

Static multi-page site: plain HTML + CSS + vanilla JS. **No build step, no
dependencies, no package.json, no test suite.** Deploys as-is to GitHub Pages via
`.github/workflows/deploy-pages.yml` on push to `main`.

## Where things live

| Path | What it is |
|---|---|
| `js/site-config.js` | `window.SITE` — branding, contact, nav, footer, payment provider. **Single source of truth**; rebranding happens here only. |
| `js/products.js` | `window.PRODUCTS` — the catalog array. Fields: `id, name, category, price, sale, badge, bestseller, inStock, blurb, buyUrl?` |
| `js/payment-links.js` | `window.PAYMENT_LINKS` — **generated**, do not hand-edit. Written by `scripts/create-stripe-payment-links.mjs`. |
| `js/components.js` | Renders shared header / footer / age-gate from `SITE`. |
| `js/main.js` | Renders product grids + UI interactions. |
| `js/rat-pack.js`, `css/rat-pack.css` | "THE RAT PACK" animated mascot section — home page only. |
| `css/styles.css` | All other styling. CSS variables at the top. |

Pages: `index`, `about`, `peptides`, `wholesale`, `contact`, `coa`.
`aminos.html` and `accessories.html` were **removed** (commit f766954) — the
README still lists them and is stale.

## Conventions

- Scripts attach to `window.*` globals and are loaded via plain `<script>` tags.
  There is no module system — don't introduce `import`/`export` in `js/`.
- Load order matters: `site-config.js` → `products.js` → `payment-links.js` →
  `components.js` → `main.js`.
- Adding a product means adding one object to `window.PRODUCTS`; the grids on
  every page derive from it. Don't hardcode product markup into HTML.

## Checking work

No test runner. Verify with syntax checks and a data sanity check:

```bash
node --check js/products.js && node --check js/site-config.js && node --check js/main.js
```

For visual checks, open the HTML files directly — no server needed.

## Hard rules

- **Never commit a Stripe secret key** (`sk_...`). Only publishable keys and
  payment-link URLs belong in `site-config.js` — that file ships to the browser.
- Product copy is research-use framing. Keep the compliance disclaimers and the
  age gate intact; don't write copy implying human therapeutic use.
- Prices/branding are placeholders in origin, but treat current values as
  intentional — don't "restore" them to template defaults.
