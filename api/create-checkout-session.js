/* ============================================================================
   Serverless checkout — creates a Stripe Checkout Session for a whole cart.

   Deploy this repo to Vercel (or Netlify) and set ONE environment variable in
   that host's dashboard:

     STRIPE_SECRET_KEY = sk_test_...   (then sk_live_... when you go live)

   Then set  payment.checkoutEndpoint: "/api/create-checkout-session"  in
   js/site-config.js. The cart will POST here and get back a Stripe-hosted
   checkout URL — one payment for every item in the cart.

   The secret key lives ONLY in the host's environment. It is never committed,
   never sent to the browser, and never appears in any file in this repo.

   Prices are recomputed here from js/products.js — the server never trusts a
   price sent by the client.
   ========================================================================== */
const fs = require("fs");
const path = require("path");

const CURRENCY = "usd";

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

/* Load window.PRODUCTS from js/products.js without a module system. */
function loadVariants() {
  const src = fs.readFileSync(catalogPath(), "utf8");
  const win = {};
  new Function("window", src)(win);
  const map = {};
  (win.PRODUCTS || []).forEach((p) => {
    (p.variants || []).forEach((v) => {
      map[v.id] = { name: `${p.name} — ${v.label}`, price: v.price };
    });
  });
  return map;
}

async function stripe(endpoint, params, key) {
  const res = await fetch("https://api.stripe.com/v1/" + endpoint, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + key,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams(params)
  });
  const json = await res.json();
  if (!res.ok) throw new Error((json.error && json.error.message) || "Stripe error");
  return json;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    res.status(500).json({ error: "Checkout is not configured." });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const items = Array.isArray(body.items) ? body.items : [];
    if (!items.length) {
      res.status(400).json({ error: "Cart is empty." });
      return;
    }

    const variants = loadVariants();
    const params = {};
    let n = 0;

    for (const item of items) {
      const v = variants[item.variantId];
      if (!v) {
        res.status(400).json({ error: "Unknown item in cart." });
        return;
      }
      const qty = Math.min(Math.max(parseInt(item.qty, 10) || 1, 1), 99);
      params[`line_items[${n}][price_data][currency]`] = CURRENCY;
      params[`line_items[${n}][price_data][product_data][name]`] = v.name;
      params[`line_items[${n}][price_data][unit_amount]`] = String(Math.round(v.price * 100));
      params[`line_items[${n}][quantity]`] = String(qty);
      n++;
    }

    const proto = (req.headers["x-forwarded-proto"] || "https").split(",")[0];
    const origin = `${proto}://${req.headers.host}`;

    params.mode = "payment";
    params.success_url = `${origin}/?checkout=success`;
    params.cancel_url = `${origin}/?checkout=cancelled`;
    params["shipping_address_collection[allowed_countries][0]"] = "US";

    const session = await stripe("checkout/sessions", params, key);
    res.status(200).json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message || "Could not start checkout." });
  }
};
