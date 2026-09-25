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
   checkout. api/_order.js checks the account, validates the research-use
   details, recomputes every price from js/products.js (never trusts the
   client), and records the order; this then asks NOWPayments for an
   invoice and answers { url }.
   ========================================================================== */
const { configured, updateOrder } = require("./_supabase");
const { BadRequest, requireBuyer, createOrder, origin } = require("./_order");

const API = {
  sandbox: "https://api-sandbox.nowpayments.io/v1",
  production: "https://api.nowpayments.io/v1"
};

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
    const user = await requireBuyer(req, res);
    if (!user) return;

    const { order, site } = await createOrder(req, user, "nowpayments", "pending");
    const base = origin(req);

    // Preview deployments sit behind Vercel's login wall, which would turn
    // NOWPayments' webhook away. When "Protection Bypass for Automation" is
    // on, Vercel provides this secret; pass it on previews only.
    let ipnUrl = `${base}/api/nowpayments-ipn`;
    const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
    if (bypass && process.env.VERCEL_ENV === "preview") {
      ipnUrl += `?x-vercel-protection-bypass=${encodeURIComponent(bypass)}`;
    }

    const r = await fetch(`${api}/invoice`, {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        price_amount: order.total_cents / 100,
        price_currency: "usd",
        order_id: order.id,
        order_description: `${site.brand} order ${order.order_number}`,
        ipn_callback_url: ipnUrl,
        success_url: `${base}/checkout.html?checkout=success&order=${encodeURIComponent(order.order_number)}`,
        cancel_url: `${base}/checkout.html?checkout=cancelled`,
        partially_paid_url: `${base}/account.html`
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
