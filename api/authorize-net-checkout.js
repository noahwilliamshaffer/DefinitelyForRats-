/* ============================================================================
   Serverless checkout — Authorize.net Accept Hosted, one payment for the
   whole cart.

   Authorize.net is the gateway most high-risk merchant processors board
   accounts onto. The buyer types their card on Authorize.net's own hosted
   page, so no card data ever touches this site.

   Set THREE environment variables in the host's dashboard (Vercel/Netlify):

     AUTHNET_API_LOGIN_ID     from Account → Settings → API Credentials & Keys
     AUTHNET_TRANSACTION_KEY  same page ("New Transaction Key")
     AUTHNET_ENV              "sandbox" while testing, "production" when live

   These never go in this repo — every js/ file ships to the browser.

   Flow: the cart POSTs { items } here; this recomputes every price from
   js/products.js (never trusts the client), asks Authorize.net for a
   hosted-payment token, and answers { url, token }. The cart then
   form-POSTs that token to the url — Authorize.net requires a POST, a plain
   redirect will not work.
   ========================================================================== */
const { loadVariants } = require("./_catalog");

const ENDPOINTS = {
  sandbox: {
    api: "https://apitest.authorize.net/xml/v1/request.api",
    page: "https://test.authorize.net/payment/payment"
  },
  production: {
    api: "https://api.authorize.net/xml/v1/request.api",
    page: "https://accept.authorize.net/payment/payment"
  }
};

const MAX_LINES = 30;          // Authorize.net's limit on lineItems
const MERCHANT_NAME = "Definitely For Rats";

// Authorize.net caps itemId and name at 31 characters.
function clip(s, n) {
  s = String(s);
  return s.length > n ? s.slice(0, n) : s;
}

function dollars(cents) {
  return (cents / 100).toFixed(2);
}

// Settings are passed as JSON *strings* inside the JSON request.
function setting(name, value) {
  return { settingName: name, settingValue: JSON.stringify(value) };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  const loginId = process.env.AUTHNET_API_LOGIN_ID;
  const txnKey = process.env.AUTHNET_TRANSACTION_KEY;
  const env = ENDPOINTS[process.env.AUTHNET_ENV === "production" ? "production" : "sandbox"];
  if (!loginId || !txnKey) {
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
    if (items.length > MAX_LINES) {
      res.status(400).json({ error: "Too many different items in one order." });
      return;
    }

    const variants = loadVariants();
    const lineItem = [];
    let totalCents = 0;

    for (const item of items) {
      const v = variants[item.variantId];
      if (!v) {
        res.status(400).json({ error: "Unknown item in cart." });
        return;
      }
      const qty = Math.min(Math.max(parseInt(item.qty, 10) || 1, 1), 99);
      const unitCents = Math.round(v.price * 100);
      totalCents += unitCents * qty;
      lineItem.push({
        itemId: clip(item.variantId, 31),
        name: clip(v.product, 31),
        description: v.label,
        quantity: String(qty),
        unitPrice: dollars(unitCents)
      });
    }

    const proto = (req.headers["x-forwarded-proto"] || "https").split(",")[0];
    const origin = `${proto}://${req.headers.host}`;

    // Key order matters: Authorize.net's JSON API is validated against its
    // XML schema, which is sequence-sensitive.
    const payload = {
      getHostedPaymentPageRequest: {
        merchantAuthentication: { name: loginId, transactionKey: txnKey },
        transactionRequest: {
          transactionType: "authCaptureTransaction",
          amount: dollars(totalCents),
          order: {
            invoiceNumber: "DFR" + Date.now().toString(36).toUpperCase(),
            description: "Research supplies"
          },
          lineItems: { lineItem }
        },
        hostedPaymentSettings: {
          setting: [
            setting("hostedPaymentReturnOptions", {
              showReceipt: false,
              url: `${origin}/checkout.html?checkout=success`,
              urlText: "Continue",
              cancelUrl: `${origin}/checkout.html?checkout=cancelled`,
              cancelUrlText: "Back to cart"
            }),
            setting("hostedPaymentButtonOptions", { text: "Pay" }),
            setting("hostedPaymentOrderOptions", { show: true, merchantName: MERCHANT_NAME }),
            setting("hostedPaymentPaymentOptions", {
              cardCodeRequired: true, showCreditCard: true, showBankAccount: false
            }),
            setting("hostedPaymentBillingAddressOptions", { show: true, required: true }),
            setting("hostedPaymentShippingAddressOptions", { show: true, required: true }),
            setting("hostedPaymentCustomerOptions", {
              showEmail: true, requiredEmail: true, addPaymentProfile: false
            })
          ]
        }
      }
    };

    const r = await fetch(env.api, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    // Authorize.net prefixes its JSON with a byte-order mark.
    const text = (await r.text()).replace(/^﻿/, "");
    const json = JSON.parse(text);

    if (!json.token || !json.messages || json.messages.resultCode !== "Ok") {
      const m = json.messages && json.messages.message && json.messages.message[0];
      throw new Error(m ? `${m.code}: ${m.text}` : "Authorize.net error");
    }

    res.status(200).json({ url: env.page, token: json.token });
  } catch (err) {
    // The detail goes to the function log; the buyer only ever sees the
    // cart's own friendly message.
    console.error("authorize-net-checkout:", err);
    res.status(502).json({ error: "Could not start checkout." });
  }
};
