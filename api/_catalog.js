/* ============================================================================
   Shared by the checkout functions: loads the catalogue from js/products.js
   so prices are always recomputed server-side, never taken from the client.

   The leading underscore keeps Vercel from deploying this file as its own
   endpoint.
   ========================================================================== */
const fs = require("fs");
const path = require("path");

/* Locate js/products.js. Serverless bundles do not always run with the repo
   root as cwd, so try there first and fall back to a path relative to this
   file. vercel.json's includeFiles is what gets the catalogue into the
   bundle in the first place — without it this throws ENOENT at runtime. */
function catalogPath() {
  const candidates = [
    path.join(process.cwd(), "js", "products.js"),
    path.join(__dirname, "..", "js", "products.js")
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error("Catalogue not found — check includeFiles in vercel.json.");
}

/* Load window.PRODUCTS from js/products.js without a module system.
   Returns variantId → { product, label, price }. */
function loadVariants() {
  const src = fs.readFileSync(catalogPath(), "utf8");
  const win = {};
  new Function("window", src)(win);
  const map = {};
  (win.PRODUCTS || []).forEach((p) => {
    (p.variants || []).forEach((v) => {
      map[v.id] = { product: p.name, label: v.label, price: v.price };
    });
  });
  return map;
}

module.exports = { loadVariants };
