/* ============================================================================
   Serverless checkout — crypto via a NOWPayments hosted invoice, one payment
   for the whole cart.

   The buyer picks a coin and pays on NOWPayments' own page; no wallet or key
   ever touches this site. NOWPayments then calls api/nowpayments-ipn.js as
   the payment moves through the chain, and that marks the order paid.

   Env vars on the host (Vercel → Project → Settings → Environment Variables):

     NOWPAYMENTS_API_KEY        Dashboard → Settings → Payments → API keys
     NOWPAYMENTS_IPN_SECRET     Dashboard → Settings → Payments → IPN secret
                                (used by nowpayments-ipn.js)
     NOWPAYMENTS_ENV            "sandbox" while testing, "production" when live
     SUPABASE_URL               see api/_supabase.js
     SUPABASE_SECRET_KEY        see api/_supabase.js

   None of these go in this repo — every js/ file ships to the browser.

   Flow: the cart POSTs { items, details } here with the buyer's Supabase
   access token as a Bearer header. No token, no order: there is no guest
   checkout. This checks the account, validates the research-use details,
   recomputes every price from js/products.js (never trusts the client),
   records the order, asks NOWPayments for an invoice, and answers { url }.
   ========================================================================== */
const { loadVariants, loadSite } = require("./_catalog");
const { configured, getUser, insertOrder, updateOrder } = require("./_supabase");

const API = {
  sandbox: "https://api-sandbox.nowpayments.io/v1",
  production: "https://api.nowpayments.io/v1"
};

const MAX_LINES = 30;

class BadRequest extends Error {}

function text(v, max) {
  const s = typeof v === "string" ? v.trim() : "";
  return s.length > max ? s.slice(0, max) : s;
}

function required(details, key, label, max) {
  const v = text(details[key], max || 120);
  if (!v) throw new BadRequest(label + " is required.");
  return v;
}

function oneOf(details, key, label, allowed) {
  const v = text(details[key], 120);
  if (allowed.indexOf(v) === -1) throw new BadRequest("Choose a " + label + ".");
  return v;
}

function orderNumber() {
  const rand = Math.floor(Math.random() * 36 * 36).toString(36).padStart(2, "0");
  return ("VRL-" + Date.now().toString(36) + rand).toUpperCase();
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  const api = API[process.env.NOWPAYMENTS_ENV === "production" ? "production" : "sandbox"];
  if (!apiKey || !configured()) {
    res.status(500).json({ error: "Checkout is not configured." });
    return;
  }

  try {
    const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const user = await getUser(token);
    if (!user) {
      res.status(401).json({ error: "Sign in to your account to check out." });
      return;
    }
    if (!user.email_confirmed_at) {
      res.status(403).json({ error: "Confirm your email address before placing an order." });
      return;
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const items = Array.isArray(body.items) ? body.items : [];
    const details = body.details && typeof body.details === "object" ? body.details : {};

    if (!items.length) throw new BadRequest("Cart is empty.");
    if (items.length > MAX_LINES) throw new BadRequest("Too many different items in one order.");

    // The two acknowledgements are recorded with a timestamp, so they must be
    // explicit trues — not merely truthy.
    if (details.researchUseAck !== true) {
      throw new BadRequest("Confirm that the products are for research use only.");
    }
    if (details.termsAccepted !== true) {
      throw new BadRequest("Agree to the Terms & Conditions to place an order.");
    }

    const site = loadSite();
    const shipState = required(details, "shipState", "State", 20).toUpperCase();
    const shipZip = required(details, "shipZip", "ZIP code", 10);
    if (!/^[A-Z]{2}$/.test(shipState)) throw new BadRequest("Use the two-letter state code.");
    if (!/^\d{5}(-\d{4})?$/.test(shipZip)) throw new BadRequest("Enter a valid US ZIP code.");

    const customer = {
      contact_name: required(details, "contactName", "Your name"),
      company_name: required(details, "companyName", "Company or institution name", 160),
      organization_type: oneOf(details, "organizationType", "organization type", site.organizationTypes),
      research_field: oneOf(details, "researchField", "research field", site.researchFields),
      phone: required(details, "phone", "Phone number", 40),
      ship_line1: required(details, "shipLine1", "Street address", 160),
      ship_line2: text(details.shipLine2, 160) || null,
      ship_city: required(details, "shipCity", "City", 80),
      ship_state: shipState,
      ship_zip: shipZip,
      ship_country: "US"
    };

    const variants = loadVariants();
    const lines = [];
    let totalCents = 0;
    for (const item of items) {
      const v = variants[item.variantId];
      if (!v) throw new BadRequest("Unknown item in cart.");
      const qty = Math.min(Math.max(parseInt(item.qty, 10) || 1, 1), 99);
      const unitCents = Math.round(v.price * 100);
      totalCents += unitCents * qty;
      lines.push({ variantId: item.variantId, product: v.product, label: v.label, unitPrice: unitCents / 100, qty });
    }

    const now = new Date().toISOString();
    const order = await insertOrder(Object.assign({
      order_number: orderNumber(),
      user_id: user.id,
      email: user.email,
      status: "pending",
      items: lines,
      total_cents: totalCents,
      currency: "usd",
      research_use_ack_at: now,
      terms_accepted_at: now,
      client_ip: String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || null,
      user_agent: text(req.headers["user-agent"], 300) || null,
      payment_provider: "nowpayments"
    }, customer));

    const proto = (req.headers["x-forwarded-proto"] || "https").split(",")[0];
    const origin = `${proto}://${req.headers.host}`;

    const r = await fetch(`${api}/invoice`, {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        price_amount: totalCents / 100,
        price_currency: "usd",
        order_id: order.id,
        order_description: `${site.brand} order ${order.order_number}`,
        ipn_callback_url: `${origin}/api/nowpayments-ipn`,
        success_url: `${origin}/checkout.html?checkout=success&order=${encodeURIComponent(order.order_number)}`,
        cancel_url: `${origin}/checkout.html?checkout=cancelled`,
        partially_paid_url: `${origin}/account.html`
      })
    });
    const invoice = await r.json().catch(() => ({}));
    if (!r.ok || !invoice.invoice_url) {
      await updateOrder(order.id, { status: "failed", payment_status: "invoice_error" }).catch(() => {});
      throw new Error(`NOWPayments ${r.status}: ${JSON.stringify(invoice)}`);
    }

    await updateOrder(order.id, {
      status: "awaiting_payment",
      provider_invoice_id: String(invoice.id)
    });

    res.status(200).json({ url: invoice.invoice_url, orderNumber: order.order_number });
  } catch (err) {
    if (err instanceof BadRequest) {
      res.status(400).json({ error: err.message });
      return;
    }
    // The detail goes to the function log; the buyer only ever sees the
    // cart's own friendly message.
    console.error("crypto-checkout:", err);
    res.status(502).json({ error: "Could not start checkout." });
  }
};
