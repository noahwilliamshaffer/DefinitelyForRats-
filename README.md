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

## Notes

- **Demo only.** The cart, forms, search, and COA lookup are front-end stubs.
  There is no real checkout, payment, or backend — wire those up to your own
  commerce/email backend before going live.
- **Research use only.** The site includes a 21+ age gate and research-only
  disclaimers consistent with this product category. Confirm the legal and
  compliance requirements for your jurisdiction before selling anything.

## Run locally

Just open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000
```

Then visit http://localhost:8000
