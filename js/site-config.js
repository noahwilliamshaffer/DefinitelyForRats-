/* ============================================================================
   SITE CONFIG — single source of truth for branding & site-wide settings.
   To rebrand, edit the values here; the page, age gate, and disclaimers all
   read from this object.
   ========================================================================== */
window.SITE = {
  brand: "DEFINITELY FOR RATS",
  legalName: "Definitely For Rats",

  // Compliance disclaimer — shown under the hero, in the footer, and in the
  // age gate. Load-bearing: do not shorten, collapse, or hide it.
  disclaimer:
    "Products are sold for laboratory research use only and are not for " +
    "human consumption. Effects described refer to laboratory rodent " +
    "research. They are definitely for rats.",

  ageGate: 21,                         // minimum age (years)
  currencySymbol: "$",

  // Payments. The provider decides which serverless function checkout
  // POSTs to; each one recomputes prices server-side and returns a hosted
  // payment page for the whole cart.
  //
  //   "authorizenet" → /api/authorize-net-checkout   (high-risk processor via
  //                     Authorize.net; needs AUTHNET_* env vars on the host)
  //   "stripe"       → /api/create-checkout-session  (needs STRIPE_SECRET_KEY;
  //                     falls back to js/payment-links.js if unreachable)
  //
  // NEVER put a secret key or transaction key in this file — it ships to the
  // browser. Keys live only in the host's environment (Vercel/Netlify).
  // GitHub Pages cannot run functions, so checkout needs one of those hosts.
  payment: {
    provider: "authorizenet",
    currency: "usd",
    checkoutEndpoint: "/api/authorize-net-checkout"
  }
};
