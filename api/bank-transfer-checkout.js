/* ============================================================================
   Checkout by manual bank transfer. No processor: the buyer sends the money
   themselves (ACH, wire, or whatever BANK_TRANSFER_INSTRUCTIONS lists) with
   the order number as the reference. The store owner marks the order paid
   in Supabase (Table editor → orders → status = "paid") once funds arrive,
   and ships after that.

   Env vars on the host:

     BANK_TRANSFER_INSTRUCTIONS  Multi-line text shown to the buyer: bank
                                 name, account name, routing and account
                                 numbers, wire details. Kept out of the repo
                                 and out of every public page — it is only
                                 ever returned to a signed-in buyer with an
                                 order awaiting transfer.
     SUPABASE_URL, SUPABASE_SECRET_KEY  see api/_supabase.js

   POST { items, details }  → records the order as awaiting_transfer and
                              answers { orderNumber, total, instructions,
                              holdDays }.
   GET  ?order=VRL-…        → the same instructions again, for one of the
                              signed-in buyer's own orders still awaiting
                              transfer (the Account page uses this).
   ========================================================================== */
const { configured, getUserOrder } = require("./_supabase");
const { BadRequest, requireBuyer, createOrder } = require("./_order");
const { loadSite } = require("./_catalog");

function instructions() {
  return (process.env.BANK_TRANSFER_INSTRUCTIONS || "").trim();
}

function holdDays() {
  const p = loadSite().policy || {};
  return p.transferHoldDays || "7";
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST" && req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }
  if (!instructions() || !configured()) {
    res.status(500).json({ error: "Checkout is not configured." });
    return;
  }

  try {
    const user = await requireBuyer(req, res);
    if (!user) return;

    if (req.method === "GET") {
      const number = String((req.query && req.query.order) || "");
      const order = number ? await getUserOrder(number, user.id) : null;
      if (!order || order.status !== "awaiting_transfer") {
        res.status(404).json({ error: "That order is not awaiting a bank transfer." });
        return;
      }
      res.status(200).json({
        orderNumber: order.order_number,
        total: order.total_cents / 100,
        instructions: instructions(),
        holdDays: holdDays()
      });
      return;
    }

    const { order } = await createOrder(req, user, "bank_transfer", "awaiting_transfer");
    res.status(200).json({
      orderNumber: order.order_number,
      total: order.total_cents / 100,
      instructions: instructions(),
      holdDays: holdDays()
    });
  } catch (err) {
    if (err instanceof BadRequest) {
      res.status(400).json({ error: err.message });
      return;
    }
    console.error("bank-transfer-checkout:", err);
    res.status(502).json({ error: "Could not place the order." });
  }
};
