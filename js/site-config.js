/* ============================================================================
   SITE CONFIG — single source of truth for branding & site-wide settings.
   To rebrand the entire site, edit the values in this object. Nothing else
   needs to change: the header, footer, page titles, and disclaimers all read
   from here.
   ========================================================================== */
window.SITE = {
  // --- Brand -----------------------------------------------------------------
  brand: "APEX PEPTIDES",              // <-- change this to rebrand everything
  brandShort: "APEX",
  tagline: "Research Peptides & Compounds",
  legalName: "Apex Research Labs",

  // --- Contact ---------------------------------------------------------------
  email: "support@apexpeptides.example",
  supportHours: "Mon–Fri, 9am–5pm EST",

  // --- Form delivery ---------------------------------------------------------
  // Wire the Contact & Wholesale forms to an email service WITHOUT a backend.
  // Two zero-cost options (pick one, paste your value, done):
  //   • Formspree   -> create a form at formspree.io, set:
  //                    formEndpoint: "https://formspree.io/f/XXXXXXXX"
  //   • Web3Forms   -> get a free access key at web3forms.com, set:
  //                    formEndpoint: "https://api.web3forms.com/submit"
  //                    formAccessKey: "your-access-key"
  // Leave formEndpoint empty ("") to keep the forms in harmless demo mode.
  formEndpoint: "",
  formAccessKey: "",

  // --- Payments --------------------------------------------------------------
  // How customers pay. No backend/server required for either real option.
  // IMPORTANT: only ever put PUBLIC/publishable values here (payment-link URLs,
  // publishable keys, Snipcart PUBLIC API key). NEVER put a Stripe secret key
  // (sk_...) or any private key in this file — it ships to the browser.
  //
  //   provider: "none"     -> demo cart only (default, no real payments)
  //   provider: "stripe"   -> per-product Stripe Payment Links. Create a link
  //                           per product at dashboard.stripe.com/payment-links,
  //                           then set `buyUrl` on that item in js/products.js.
  //                           Stripe hosts the entire checkout (PCI handled).
  //   provider: "snipcart" -> full hosted cart + checkout on a static site.
  //                           Set snipcartKey to your Snipcart PUBLIC API key.
  payment: {
    provider: "none",
    snipcartKey: "",
    currency: "usd"
  },

  // --- Commerce settings -----------------------------------------------------
  currency: "$",
  freeShipThreshold: 200,              // free USA shipping over this amount
  sameDayCutoff: "2 PM EST",
  purity: "99%+",
  ageGate: 21,                         // minimum age (years)

  // --- Primary navigation ----------------------------------------------------
  nav: [
    { label: "Home",         href: "index.html" },
    { label: "Our Company",  href: "about.html" },
    { label: "Buy Peptides", href: "peptides.html" },
    { label: "Buy Aminos",   href: "aminos.html" },
    { label: "Accessories",  href: "accessories.html" },
    { label: "Wholesale",    href: "wholesale.html" },
    { label: "Contact Us",   href: "contact.html" },
    { label: "COA",          href: "coa.html" }
  ],

  // --- Footer columns --------------------------------------------------------
  footer: {
    columns: [
      {
        title: "Categories",
        links: [
          { label: "Peptides",    href: "peptides.html" },
          { label: "Aminos",      href: "aminos.html" },
          { label: "Accessories", href: "accessories.html" },
          { label: "Wholesale",   href: "wholesale.html" }
        ]
      },
      {
        title: "Legal",
        links: [
          { label: "Privacy Policy",   href: "#" },
          { label: "Shipping Policy",  href: "#" },
          { label: "Returns & Refunds", href: "#" },
          { label: "Terms of Service", href: "#" }
        ]
      },
      {
        title: "Store",
        links: [
          { label: "Cart",     href: "#" },
          { label: "Checkout", href: "#" },
          { label: "My Account", href: "#" }
        ]
      },
      {
        title: "Support",
        links: [
          { label: "Contact Us",   href: "contact.html" },
          { label: "Our Company",  href: "about.html" },
          { label: "COA Lookup",   href: "coa.html" }
        ]
      }
    ]
  },

  // --- Compliance disclaimer (shown site-wide) -------------------------------
  disclaimer:
    "All products are intended strictly for in vitro laboratory research and " +
    "experimentation. They are NOT for human or animal consumption, and are " +
    "not drugs, foods, cosmetics, or medical devices. By purchasing you certify " +
    "you are a qualified researcher and will handle all products responsibly."
};
