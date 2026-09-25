/* ============================================================================
   Shared by the checkout functions: loads the catalogue from js/products.js
   so prices are always recomputed server-side, never taken from the client,
   and the brand name and account settings from js/site-config.js.

   The leading underscore keeps Vercel from deploying this file as its own
   endpoint.
   ========================================================================== */
const fs = require("fs");
const path = require("path");

/* Locate a file under js/. Serverless bundles do not always run with the repo
   root as cwd, so try there first and fall back to a path relative to this
   file. vercel.json's includeFiles is what gets the catalogue into the
   bundle in the first place — without it this throws ENOENT at runtime. */
function jsPath(name) {
  const candidates = [
    path.join(process.cwd(), "js", name),
    path.join(__dirname, "..", "js", name)
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error(name + " not found — check includeFiles in vercel.json.");
}

/* Run a browser script that assigns to window.* and return that window. */
function loadWindow(name) {
  const win = {};
  new Function("window", fs.readFileSync(jsPath(name), "utf8"))(win);
  return win;
}

/* Load window.PRODUCTS from js/products.js without a module system.
   Returns variantId → { product, label, price }. */
function loadVariants() {
  const win = loadWindow("products.js");
  const map = {};
  (win.PRODUCTS || []).forEach((p) => {
    (p.variants || []).forEach((v) => {
      map[v.id] = { product: p.name, label: v.label, price: v.price };
    });
  });
  return map;
}

/* The whole window.SITE from js/site-config.js. */
function loadSite() {
  return loadWindow("site-config.js").SITE;
}

/* The brand name from js/site-config.js, for the hosted payment page. */
function loadBrand() {
  return loadSite().brand;
}

module.exports = { loadVariants, loadSite, loadBrand };
