/* ============================================================================
   Shared by every checkout function: the account check, the research-use
   order details, server-side pricing, and the orders row. Each payment
   method (crypto, bank transfer, later cards) only adds what happens after
   the order is recorded — so the compliance rules live in exactly one place.

   The leading underscore keeps Vercel from deploying this file as its own
   endpoint.
   ========================================================================== */
const { loadVariants, loadSite } = require("./_catalog");
const { getUser, insertOrder } = require("./_supabase");

const MAX_LINES = 30;

/* A problem the buyer can fix. Its message is shown to them as-is. */
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

function parseBody(req) {
  return typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
}

/* The signed-in, email-confirmed buyer — or null after answering 401/403.
   No account, no order: there is no guest checkout. */
async function requireBuyer(req, res) {
  const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  const user = await getUser(token);
  if (!user) {
    res.status(401).json({ error: "Sign in to your account to check out." });
    return null;
  }
  if (!user.email_confirmed_at) {
    res.status(403).json({ error: "Confirm your email address before placing an order." });
    return null;
  }
  return user;
}

/* Validate the cart and order details, recompute every price from
   js/products.js (never trusting the client), and record the order.
   Returns { order, site }. Throws BadRequest for anything the buyer must fix. */
async function createOrder(req, user, provider, status) {
  const site = loadSite();
  if (!(site.payment && site.payment.ordersOpen)) {
    throw new BadRequest("Online ordering is not open yet. Please contact us to place an order.");
  }

  const body = parseBody(req);
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
    status,
    items: lines,
    total_cents: totalCents,
    currency: "usd",
    research_use_ack_at: now,
    terms_accepted_at: now,
    client_ip: String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || null,
    user_agent: text(req.headers["user-agent"], 300) || null,
    payment_provider: provider
  }, customer));

  return { order, site };
}

function origin(req) {
  const proto = (req.headers["x-forwarded-proto"] || "https").split(",")[0];
  return `${proto}://${req.headers.host}`;
}

module.exports = { BadRequest, requireBuyer, createOrder, origin };
