/* ============================================================================
   PRODUCT CATALOG — edit this array to manage what appears in the store.
   Placeholder listings using generic research-compound names (which are not
   trademarks). Replace names, prices, and copy with your own. Prices are
   illustrative only.

   PAYMENTS: when SITE.payment.provider === "stripe", link creation is handled
   by scripts/create-stripe-payment-links.mjs, which writes js/payment-links.js.
   You can also set a `buyUrl` manually on a product to override it.

   Fields: id, name, category, price, sale (or null), badge, bestseller,
   inStock, blurb, optional buyUrl.
   ========================================================================== */
window.PRODUCTS = [
  /* ---- Repair & recovery ------------------------------------------------- */
  { id: "bpc-157", name: "BPC-157 10mg (10 vials/kit)", category: "peptides", price: 178, sale: 152, badge: "sale", bestseller: true, inStock: true,
    buyUrl: "", /* generator fills this, or paste a Stripe Payment Link here */
    blurb: "Stable gastric pentadecapeptide — the widely studied tissue-repair starter peptide. Lyophilized, 99%+ purity." },
  { id: "tb-500", name: "TB-500 10mg (10 vials/kit)", category: "peptides", price: 168, sale: 138, badge: "sale", bestseller: true, inStock: true,
    blurb: "Thymosin beta-4 fragment; commonly paired with BPC-157 in recovery research. Batch tested." },

  /* ---- Metabolic / GLP-class --------------------------------------------- */
  { id: "retatrutide", name: "Retatrutide 10mg (10 vials/kit)", category: "peptides", price: 328, sale: 268, badge: "sale", bestseller: true, inStock: true,
    blurb: "Triple agonist (GLP-1 / GIP / glucagon) research peptide. Lyophilized, third-party COA." },
  { id: "tirzepatide", name: "Tirzepatide 10mg (10 vials/kit)", category: "peptides", price: 298, sale: 238, badge: "sale", bestseller: true, inStock: true,
    blurb: "Dual GIP / GLP-1 agonist research peptide. 99%+ purity, batch tested." },
  { id: "semaglutide", name: "Semaglutide 10mg (10 vials/kit)", category: "peptides", price: 258, sale: 198, badge: "sale", bestseller: true, inStock: true,
    blurb: "GLP-1 receptor agonist research peptide. Third-party COA." },

  /* ---- GH-axis secretagogues --------------------------------------------- */
  { id: "ipamorelin", name: "Ipamorelin 5mg (10 vials/kit)", category: "peptides", price: 132, sale: 108, badge: "sale", bestseller: false, inStock: true,
    blurb: "Selective growth-hormone secretagogue with a clean research profile. Research use only." },
  { id: "cjc-1295-dac", name: "CJC-1295 with DAC 5mg (10 vials/kit)", category: "peptides", price: 158, sale: 132, badge: "sale", bestseller: false, inStock: true,
    blurb: "Long-acting GHRH analog; often stacked with Ipamorelin in GH-axis research. Batch tested." },
  { id: "cjc-1295-no-dac", name: "CJC-1295 no DAC (Mod GRF 1-29) 5mg (10 vials/kit)", category: "peptides", price: 138, sale: 118, badge: "sale", bestseller: false, inStock: true,
    blurb: "Modified GRF (1-29) GHRH analog. Lyophilized research peptide." },
  { id: "tesamorelin", name: "Tesamorelin 10mg (10 vials/kit)", category: "peptides", price: 368, sale: 288, badge: "sale", bestseller: false, inStock: true,
    blurb: "GHRH analog research peptide. Lyophilized powder, third-party verified." },
  { id: "sermorelin", name: "Sermorelin 5mg (10 vials/kit)", category: "peptides", price: 148, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "GHRH (1-29) analog; long-referenced GH secretagogue. Batch tested." },

  /* ---- Immune / tissue repair -------------------------------------------- */
  { id: "thymosin-a1", name: "Thymosin Alpha-1 10mg (10 vials/kit)", category: "peptides", price: 198, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Thymosin alpha-1 (Tα1) — immune-modulation and tissue-repair research. 99%+ purity." },

  /* ---- NAD+ -------------------------------------------------------------- */
  { id: "nad-500", name: "NAD+ 500mg Buffered (10 vials/kit)", category: "peptides", price: 278, sale: 228, badge: "sale", bestseller: false, inStock: true,
    blurb: "Buffered nicotinamide adenine dinucleotide for laboratory research. Third-party tested." },
  { id: "nad-250", name: "NAD+ 250mg Buffered (10 vials/kit)", category: "peptides", price: 178, sale: 148, badge: "sale", bestseller: false, inStock: true,
    blurb: "Buffered NAD+, 250mg. Research use only, batch tested." },

  /* ---- Lab supplies -------------------------------------------------------- */
  { id: "bac-water", name: "Bacteriostatic Water 30mL (0.9% benzyl alcohol)", category: "accessories", price: 18, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Sterile reconstitution solution for laboratory use." },
  { id: "insulin-syr", name: "Insulin Syringes 31G 0.5mL (100-pack)", category: "accessories", price: 24, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Sterile single-use syringes. Laboratory supplies." }
];
