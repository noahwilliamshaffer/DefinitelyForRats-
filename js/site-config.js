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
    email: "support@verityresearchlabs.com",
    phone: "(941) 451-9208",
    hours: "[Monday–Friday, 9am–5pm ET]",
    // One line per array entry. Must match the merchant application.
    address: ["2400 West Tharpe Street", "Tallahassee, FL 32303", "United States"]
  },

  // Governing-law state for the Terms page.
  jurisdiction: "Florida",

  // Policy figures quoted on the Shipping and Refunds pages. Only state what
  // the business will actually honour.
  policy: {
    processingDays: "[1–2]",       // business days before an order ships
    transferHoldDays: "7",         // days a bank-transfer order is held unpaid
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
  //   "nowpayments"  → /api/crypto-checkout          (ACTIVE — crypto via a
  //                     NOWPayments hosted invoice; needs NOWPAYMENTS_* and
  //                     SUPABASE_* env vars on the host)
  //
  // Alongside it, bankTransferEndpoint offers manual bank transfer
  // (api/bank-transfer-checkout.js; needs BANK_TRANSFER_INSTRUCTIONS). Set it
  // to "" to hide that option.
  //   "authorizenet" → /api/authorize-net-checkout   (cards, for later;
  //                     needs AUTHNET_* env vars on the host)
  //   "stripe"       → /api/create-checkout-session  (needs STRIPE_SECRET_KEY;
  //                     falls back to js/payment-links.js if unreachable)
  //
  // NEVER put a secret key or transaction key in this file — it ships to the
  // browser. Keys live only in the host's environment (Vercel/Netlify).
  // GitHub Pages cannot run functions, so checkout needs one of those hosts.
  payment: {
    // false shows the whole checkout (accounts, order form, acknowledgements)
    // but disables Place Order with a "contact us" note, and the checkout
    // functions refuse orders. Flip to true once the live NOWPayments keys,
    // BANK_TRANSFER_INSTRUCTIONS and a custom email sender are in place.
    ordersOpen: false,
    provider: "nowpayments",
    currency: "usd",
    checkoutEndpoint: "/api/crypto-checkout",
    bankTransferEndpoint: "/api/bank-transfer-checkout"
  },

  // Customer accounts (Supabase Auth). Buying requires a signed-in account —
  // there is no guest checkout. The URL and the publishable key (sb_publishable_…)
  // are public by design and safe here; the secret key is NOT, and lives
  // only in the host's SUPABASE_SECRET_KEY env var.
  accounts: {
    supabaseUrl: "https://elgrprgmzmnvdcctnjps.supabase.co",
    supabaseAnonKey: "sb_publishable_Uy9Wfgn9o02ChPiku4fx1g_3CYiB-rD"
  },

  // Asked at sign-up and on every order. The values are what the server
  // accepts (api/crypto-checkout.js reads this list), so edit here only.
  researchFields: [
    "Molecular Biology",
    "Biochemistry",
    "Peptide Chemistry",
    "Chemical Biology",
    "Biotechnology Research",
    "Pharmacology Research",
    "Analytical Chemistry",
    "Academic Research"
  ],

  // Organisation types we sell to. Med spas, gyms, weight-loss clinics and
  // similar consumer-facing businesses are deliberately absent — the
  // processor does not accept them as customers.
  organizationTypes: [
    "University or academic institution",
    "Contract research organization",
    "Biotechnology or pharmaceutical company",
    "Independent research laboratory",
    "Government or institutional laboratory",
    "Analytical testing laboratory"
  ]
};
