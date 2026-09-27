/* ============================================================================
   Checkout by manual payment: bank transfer (ACH/wire) or Zelle. No
   processor: the buyer sends the money themselves with the order number as
   the reference. The store owner marks the order paid in Supabase (Table
   editor → orders → status = "paid") once funds arrive, and ships after.

   Env vars on the host — each method is offered only when its text is set:

     BANK_TRANSFER_INSTRUCTIONS  Multi-line text: bank, account name, routing
                                 and account numbers, wire details.
     ZELLE_INSTRUCTIONS          Multi-line text: the Zelle email or phone and
                                 the name it is registered to.
     SUPABASE_URL, SUPABASE_SECRET_KEY  see api/_supabase.js

   Both are kept out of the repo and every public page — they are only ever
   returned to a signed-in buyer with an order awaiting that payment.

   POST { items, details, method: "bank" | "zelle" }
                            → records the order as awaiting_transfer and
                              answers { method, orderNumber, total,
                              instructions, holdDays }.
   GET  ?order=VRL-…        → the same again, for one of the signed-in
                              buyer's own orders still awaiting payment (the
                              Account page uses this).
   ========================================================================== */
const { configured, getUserOrder } = require("./_supabase");
const { BadRequest, requireBuyer, createOrder } = require("./_order");
const { loadSite } = require("./_catalog");

// method → { provider recorded on the order, env var holding the details }
const METHODS = {
  bank: { provider: "bank_transfer", env: "BANK_TRANSFER_INSTRUCTIONS" },
  zelle: { provider: "zelle", env: "ZELLE_INSTRUCTIONS" }
};

function instructions(method) {
  return (process.env[METHODS[method].env] || "").trim();
}

function methodOf(provider) {
  return Object.keys(METHODS).find((m) => METHODS[m].provider === provider) || null;
}

function holdDays() {
  const p = loadSite().policy || {};
  return p.transferHoldDays || "7";
}

function answer(method, order) {
  return {
    method,
    orderNumber: order.order_number,
    total: order.total_cents / 100,
    instructions: instructions(method),
    holdDays: holdDays()
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }
  if (!configured()) {
    res.status(500).json({ error: "Checkout is not configured." });
    return;
  }

  try {
    const user = await requireBuyer(req, res);
    if (!user) return;

    if (req.method === "GET") {
      const number = String((req.query && req.query.order) || "");
      const order = number ? await getUserOrder(number, user.id) : null;
      const method = order && methodOf(order.payment_provider);
      if (!order || !method || order.status !== "awaiting_transfer" || !instructions(method)) {
        res.status(404).json({ error: "That order is not awaiting payment." });
        return;
      }
      res.status(200).json(answer(method, order));
      return;
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const method = METHODS[body.method] ? body.method : null;
    if (!method || !instructions(method)) {
      res.status(400).json({ error: "That payment method is not available. Please choose another." });
      return;
    }

    const { order } = await createOrder(req, user, METHODS[method].provider, "awaiting_transfer");
    res.status(200).json(answer(method, order));
  } catch (err) {
    if (err instanceof BadRequest) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.error("bank-transfer-checkout:", err);
    res.status(502).json({ error: "Could not place the order." });
  }
};
