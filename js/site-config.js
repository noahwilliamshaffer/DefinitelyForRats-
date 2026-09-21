/* ============================================================================
   SITE CONFIG — single source of truth for brand, contact details,
   disclaimers, and payment settings. Every page stamps these values into its
   [data-brand], [data-contact], and disclaimer slots on load.

   Before applying to a processor, replace every value in square brackets.
   Underwriters check that the business name, address, and phone here match
   the merchant application exactly.

   The brand name is also written into each HTML file as the no-script
   fallback. If it ever changes here, find-and-replace it across the *.html
   files too.
   ========================================================================== */
window.SITE = {
  brand: "Verity Research Labs",
  legalName: "Verity Research Labs LLC",

  contact: {
    email: "[support@yourdomain.com]",
    phone: "[(555) 555-0100]",
    hours: "[Monday–Friday, 9am–5pm ET]",
    // One line per array entry. Must match the merchant application.
    address: ["[Street address]", "[City, State ZIP]", "United States"]
  },

  // Governing-law state for the Terms page.
  jurisdiction: "[State]",

  // Policy figures quoted on the Shipping and Refunds pages. Only state what
  // the business will actually honour.
  policy: {
    processingDays: "[1–2]",       // business days before an order ships
    returnWindowDays: "[30]"       // days to request a return of sealed items
  },

  // Required wording, verbatim from the processor's compliance checklist.
  // `disclaimer` is the per-product notice (product pages, cards, cart, age
  // gate); `footerDisclaimer` and `fdaDisclaimer` run in every footer. Do not
  // shorten, collapse, or hide them.
  disclaimer:
    "All products currently listed on this site are for research purposes only.",
  footerDisclaimer:
    "All products sold on this website are intended for research and " +
    "identification purposes only. These products are not intended for human " +
    "dosing, injection, or ingestion. Not for human or animal consumption.",
  fdaDisclaimer:
    "These statements have not been evaluated by the Food and Drug " +
    "Administration. These products are not intended to diagnose, treat, " +
    "cure, or prevent any disease.",

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
