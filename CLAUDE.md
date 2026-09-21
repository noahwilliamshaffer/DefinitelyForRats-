# Verity Research Labs — research peptide storefront

Static site: plain HTML + CSS + vanilla JS. **No build step, no dependencies,
no package.json, no test suite.** Checkout runs as serverless functions in
`api/`, so the site deploys to Vercel (or Netlify), not GitHub Pages.

The site exists to sell research peptides through a **high-risk merchant
processor**, and every page is written to pass that processor's underwriting.
The brand is deliberately clinical — a serious research supplier. Retatrutide
is the core product; the catalogue is expected to grow.

## Pages

- `index.html` — hero → research notice strip → product cards → "Our
  standards" → footer.
- `retatrutide.html`, `bacteriostatic-water.html`, `lab-syringes.html` — one
  product page per catalogue item (gallery, buy box, 01-04 accordions,
  Description / Additional information tabs). All the same template driven by
  `<body data-product="…">`; only the title, meta description, and that
  attribute differ.
- `about.html` (Our Company), `coa.html` (certificates table, rendered from
  `coa` in the catalogue), `contact.html`.
- `terms.html`, `refunds.html`, `shipping.html`, `privacy.html` — policy
  templates. Each carries a "have a lawyer review" comment.
- `checkout.html` — the cart: lines, quantity steppers, subtotal, Checkout.

**The header and footer are repeated verbatim in every HTML file** (there is
no build step to include them). Change one, change all twelve. Adding a
product means adding it to the footer's Shop column too.

## Where things live

| Path | What it is |
|---|---|
| `js/site-config.js` | `window.SITE` — brand, legal name, contact details, jurisdiction, policy figures, the three disclaimers, age gate, payment provider. **Single source of truth**, stamped into `[data-brand]`, `[data-contact]`, etc. on load. |
| `js/products.js` | `window.PRODUCTS` — the catalog and all product copy. See the header comment for the full field list. |
| `js/payment-links.js` | `window.PAYMENT_LINKS` — **generated** variant-id → Stripe link map, used only by the inactive Stripe fallback. Do not hand-edit. |
| `js/main.js` | `window.STORE` shared helpers, config stamping, product grid, COA table, age gate. |
| `js/product-page.js` | Product-page only: gallery, buy box, accordions, tabs. |
| `js/cart.js` | Cart state (localStorage `dfr-cart-v1`), Add to cart / Buy now, checkout page. Loads on every page. |
| `api/authorize-net-checkout.js` | **Active** checkout: Authorize.net Accept Hosted token for the whole cart. |
| `api/create-checkout-session.js` | Inactive Stripe Checkout alternative. |
| `api/_catalog.js` | Shared loader: prices from `js/products.js`, brand from `js/site-config.js`. Underscore = not deployed as an endpoint. |
| `css/styles.css` | All styling. Tokens at the top, numbered sections below. |
| `assets/*.svg` | Monochrome line-art product renderings. COA PDFs go in `assets/coa/`. |

**Checkout provider** is `payment.provider` in `js/site-config.js`:

- `"authorizenet"` (active) — the cart POSTs to
  `api/authorize-net-checkout.js`, gets `{url, token}`, and form-POSTs the
  token to Authorize.net's hosted page (a redirect will not work). Keys live
  only in `AUTHNET_*` host env vars. If the endpoint fails, the buyer gets a
  plain retry message — there is no fallback, and it must never fall back to
  Stripe links (Stripe prohibits this business).
- `"stripe"` (inactive) — POSTs to `api/create-checkout-session.js`; if
  unreachable, falls back to the per-variant Payment Links, which open at
  quantity 1, so the fallback never prints a line total.

Both functions recompute every price server-side — never trust the client —
and **never surface a raw fetch or JSON-parse error to a buyer.** Add to cart
and Buy now both route through the cart, so one payment covers the order.

## Conventions

- Scripts attach to `window.*` globals via plain `<script>` tags. No module
  system — don't introduce `import`/`export` in `js/`.
- Load order: `site-config.js` → `products.js` → `payment-links.js` →
  `main.js` → `product-page.js` (product pages only) → `cart.js`.
- Product content comes from `window.PRODUCTS`, never hardcoded HTML. Adding a
  product: add its entry (with `href` and `coa`), copy a product page and
  change `data-product`, `<title>`, and the meta description, then add it to
  the footer Shop column in every page.
- Variant ids are what the server prices from. Don't rename one casually.
- Use the spacing scale (`--s-1`…`--s-10`) and the existing tokens. No ad-hoc
  margins, no second accent colour.

## Design rules

A serious Swiss pharmaceutical / laboratory-supply brand.

- **One accent** (`--accent`, safety orange) for prices, primary buttons, and
  focus rings. Hierarchy comes from size and weight, not colour.
- Nothing playful: no mascots, novelty fonts, lifestyle imagery, urgency
  counters, or bouncy motion. Product imagery is monochrome line art.
- **Motion is restrained**: ~200ms card lift of 1-2px, price fade-in.
  `prefers-reduced-motion` is respected.
- Tap targets ≥44px, visible focus at every stop, keyboard-complete
  (pills and tabs use roving tabindex + arrow keys; accordions are `<details>`).
- Images inside grid panels need `min-width: 0` — their intrinsic min-content
  width will otherwise blow the grid track out past its column.
- No horizontal scroll at 375px.

## Checking work

No test runner. Node may not be installed; syntax-check each `js/` and `api/`
file with `node --check` where available. For visual checks serve the folder
(`python3 -m http.server`) and open `index.html`.

## Hard rules — processor underwriting

These come from the processor's website compliance checklist. Breaking one
can fail underwriting or get the merchant account closed.

- **Never commit a secret key** — Stripe `sk_...` or an Authorize.net
  transaction key. They live only in host env vars. Every `js/` file ships to
  the browser.
- **Copy is scientific and technical only.** No health, weight-loss,
  anti-aging, performance, wellness, recovery, or outcome claims of any kind;
  no dosing, protocols, reconstitution or preparation steps, "cycles", or
  "stacks"; no testimonials, reviews, influencer or lifestyle framing; nothing
  implying human or animal use. Accordions carry identity, form, storage,
  closure, and disposal information only.
- **Disclaimers, verbatim from `js/site-config.js`:** the per-product notice
  on every product (card, product page, cart); the footer research disclaimer
  and the FDA disclaimer in every footer. Minimum 12px at ≥4.5:1 contrast,
  never collapsed or hover-hidden.
- Keep the 21+ age gate and its once-per-session `sessionStorage` persistence.
- **Claims stay keepable.** No purity percentages, delivery guarantees, review
  counts, "risk free", or urgency. Specs state only what the batch COA
  supports; retatrutide identifiers must be confirmed against the COA.
- Every product needs a COA no older than 15 months, named to match the
  product. A pending COA shows as "Pending publication" — never a dead link.
- Contact details, business address, and legal name on the site must match
  the merchant application exactly. USD only; US shipping only.
- Prices are intentional — don't change them without being asked.
