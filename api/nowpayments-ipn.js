/* ============================================================================
   NOWPayments IPN (webhook) — updates an order as its crypto payment moves
   through the chain. NOWPayments POSTs here, sometimes several times and not
   always in order, for each status change of the invoice's payment.

   Env: NOWPAYMENTS_IPN_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

   Every call is authenticated: the x-nowpayments-sig header must equal
   HMAC-SHA512(IPN secret, JSON of the body with keys sorted). Anything
   unsigned or mis-signed is refused before the database is touched.

   An order only becomes "paid" when NOWPayments reports "finished" AND the
   invoiced USD amount matches the order total we recorded. A mismatch parks
   the order in "review" for a human rather than shipping it.
   ========================================================================== */
const crypto = require("crypto");
const { getOrder, updateOrder } = require("./_supabase");

// NOWPayments payment_status → our order status.
const STATUS = {
  waiting: "awaiting_payment",
  confirming: "confirming",
  confirmed: "confirming",
  sending: "confirming",
  partially_paid: "partially_paid",
  finished: "paid",
  failed: "failed",
  expired: "expired",
  refunded: "refunded"
};

// Once an order reaches one of these, only a refund may move it again —
// a late "waiting" or "confirming" must never un-pay an order.
const FINAL = ["paid", "refunded", "review"];

function sortDeep(v) {
  if (Array.isArray(v)) return v.map(sortDeep);
  if (v && typeof v === "object") {
    return Object.keys(v).sort().reduce((o, k) => { o[k] = sortDeep(v[k]); return o; }, {});
  }
  return v;
}

function validSignature(body, sig, secret) {
  if (!sig || !secret) return false;
  const expected = crypto.createHmac("sha512", secret)
    .update(JSON.stringify(sortDeep(body))).digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(String(sig), "utf8");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
  } catch (e) {
    res.status(400).json({ error: "Bad JSON." });
    return;
  }

  if (!validSignature(body, req.headers["x-nowpayments-sig"], process.env.NOWPAYMENTS_IPN_SECRET)) {
    res.status(401).json({ error: "Bad signature." });
    return;
  }

  try {
    const order = body.order_id ? await getOrder(body.order_id) : null;
    if (!order) {
      // Acknowledge so NOWPayments stops retrying; there is nothing to update.
      console.warn("nowpayments-ipn: unknown order", body.order_id, body.payment_id);
      res.status(200).json({ ok: true });
      return;
    }

    let next = STATUS[body.payment_status] || order.status;

    if (next === "paid") {
      const invoicedCents = Math.round(Number(body.price_amount) * 100);
      const currencyOk = String(body.price_currency || "").toLowerCase() === order.currency;
      if (!currencyOk || invoicedCents !== order.total_cents) {
        console.error("nowpayments-ipn: amount mismatch", order.order_number, body.price_amount, body.price_currency);
        next = "review";
      }
    }

    if (FINAL.indexOf(order.status) !== -1 && next !== "refunded") {
      next = order.status;
    }

    const patch = {
      status: next,
      payment_status: body.payment_status || null,
      provider_payment_id: body.payment_id != null ? String(body.payment_id) : order.provider_payment_id,
      pay_currency: body.pay_currency || order.pay_currency,
      pay_amount: body.pay_amount != null ? body.pay_amount : order.pay_amount,
      actually_paid: body.actually_paid != null ? body.actually_paid : order.actually_paid
    };
    if (next === "paid" && !order.paid_at) patch.paid_at = new Date().toISOString();

    await updateOrder(order.id, patch);
    res.status(200).json({ ok: true });
  } catch (err) {
    // 500 so NOWPayments retries later.
    console.error("nowpayments-ipn:", err);
    res.status(500).json({ error: "Could not record payment." });
  }
};
