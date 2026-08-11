# DEFINITELY FOR RATS — research peptide storefront

Static site: plain HTML + CSS + vanilla JS. **No build step, no dependencies,
no package.json, no test suite.** Deploys as-is to GitHub Pages via
`.github/workflows/deploy-pages.yml` on push to `main`.

Two pages, and that is the entire map — main page ⇄ product page ⇄ Stripe:

- `index.html` — hero → disclaimer strip → three product cards → footer.
- `retatrutide.html` — the one product page (gallery, buy box, 01-04
  accordions, Description / Additional information tabs).

Bacteriostatic water and syringes are bought straight from their cards; only
the peptide gets a page. There are no other pages — no About/Wholesale/
Contact/COA — and nothing should link to one.

The joke and the compliance posture are the same sentence: every product is
described in terms of what it does for the buyer's rat, with a straight face.
Keep the copy deadpan; never let it wink at the reader.

## Where things live

| Path | What it is |
|---|---|
| `js/site-config.js` | `window.SITE` — brand, disclaimer, age gate, payment provider. **Single source of truth**; rebranding happens here only. |
| `js/products.js` | `window.PRODUCTS` — the catalog and all page content. See the header comment for the full field list. |
| `js/payment-links.js` | `window.PAYMENT_LINKS` — **generated** variant-id → Stripe link map, do not hand-edit. Written by `scripts/create-stripe-payment-links.mjs`. |
| `js/main.js` | `window.RATS` shared helpers, the product grid, and the age gate. Loaded by both pages. |
| `js/product-page.js` | Product-page only: gallery, buy box, accordions, tabs. Reads `<body data-product="…">`. |
| `css/styles.css` | All styling. Tokens at the top, numbered sections below. |
| `assets/*.svg` | Monochrome line-art product renderings. |

`js/cart.js`, `api/create-checkout-session.js`, and the
`payment.checkoutEndpoint` / `payment.freeShippingOver` keys in
`js/site-config.js` are **orphaned** leftovers from an earlier cart build —
nothing loads or reads them. The store ships Buy-now only; quantity is
adjusted on Stripe's hosted checkout. Don't re-wire a cart without being asked.

## Conventions

- Scripts attach to `window.*` globals via plain `<script>` tags. No module
  system — don't introduce `import`/`export` in `js/`.
- Load order matters: `site-config.js` → `products.js` → `payment-links.js` →
  `main.js` → `product-page.js` (product page only).
- Adding a product/variant means editing `window.PRODUCTS` and re-running the
  link generator. Don't hardcode product markup into HTML — both pages render
  their content from the catalog.
- A product with an `href` gets a page and a "Select options" button; one
  without is bought on its card. That flag is the only switch.
- Use the spacing scale (`--s-1`…`--s-10`) and the existing tokens. No ad-hoc
  margins, no second accent colour.

## Design rules

The design must look like a serious Swiss pharmaceutical brand that has never
considered being funny — the more rigorous it is, the harder the copy lands.

- **One accent** (`--accent`, safety orange) for prices, primary buttons, and
  focus rings. Nothing else. Hierarchy comes from size and weight, not colour.
- **No winking**: no cartoon rats, novelty fonts, garish colour, or bouncy
  motion. Any rat imagery would be a single dignified line engraving.
- **Motion is restrained**: ~200ms card lift of 1-2px, price fade-in. Nothing
  bounces or spins, and `prefers-reduced-motion` is respected.
- Tap targets ≥44px, visible focus at every stop, keyboard-complete
  (pills and tabs use roving tabindex + arrow keys; accordions are `<details>`).
- Images inside grid panels need `min-width: 0` — their intrinsic min-content
  width will otherwise blow the grid track out past its column.

## Checking work

No test runner. Verify with syntax checks:

```bash
node --check js/products.js && node --check js/site-config.js && node --check js/main.js && node --check js/product-page.js
```

For visual checks, open `index.html` directly — no server needed.

## Hard rules

- **Never commit a Stripe secret key** (`sk_...`). It lives only in the
  `STRIPE_SECRET_KEY` env var when running the generator. Every `js/` file
  ships to the browser.
- A variant with no payment link renders as a **disabled** button, never as a
  live-looking control that goes nowhere.
- Product copy is research-use framing. Effect sentences stay about THE RAT —
  no "you"/"your results", no percentages, timeframes, dosing, or
  testimonials. "Often stacked with" (descriptive) is allowed; "works better
  together" (a claim) is not. Accordion content is handling information, never
  usage instructions.
- The disclaimer appears twice per page (hero strip or product-page notice
  callout, plus the footer), minimum 12px at ≥4.5:1 contrast, never collapsed
  or hover-hidden. Keep the 21+ age gate and its once-per-session
  `sessionStorage` persistence.
- Trust rows and spec tables state only what we can keep — no purity
  percentages, delivery guarantees, or review counts.
- Prices and copy are intentional — don't "improve" or restore them without
  being asked.
