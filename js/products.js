/* ============================================================================
   PRODUCT CATALOG — edit this array to manage what appears in the store.
   These are placeholder listings using generic research-compound names.
   Replace names, prices, and copy with your own. Prices are illustrative.

   PAYMENTS: when SITE.payment.provider === "stripe", add a `buyUrl` to each
   product — the Stripe Payment Link you created for it at
   dashboard.stripe.com/payment-links. Example shown on the first item below.
   (Snipcart mode needs no per-product URL — it uses id/name/price directly.)
   ========================================================================== */
window.PRODUCTS = [
  // ---- Peptides -------------------------------------------------------------
  { id: "bpc-157",   name: "BPC-157 10mg (10 vials/kit)",        category: "peptides", price: 178, sale: 152, badge: "sale",     bestseller: true,  inStock: true,
    buyUrl: "", /* e.g. "https://buy.stripe.com/xxxxxxxx" */
    blurb: "Stable gastric pentadecapeptide. Lyophilized, 99%+ purity." },
  { id: "tb-500",    name: "TB-500 10mg (10 vials/kit)",         category: "peptides", price: 168, sale: 138, badge: "sale",     bestseller: true,  inStock: true,
    blurb: "Thymosin Beta-4 fragment. Research grade, batch tested." },
  { id: "ghk-cu",    name: "GHK-Cu 50mg (10 vials/kit)",         category: "peptides", price: 170, sale: 138, badge: "sale",     bestseller: true,  inStock: true,
    blurb: "Copper tripeptide-1, lyophilized. Multiple variants available." },
  { id: "mots-c",    name: "MOTS-C 10mg (10 vials/kit)",         category: "peptides", price: 248, sale: 188, badge: "sale",     bestseller: true,  inStock: true,
    blurb: "Mitochondrial-derived peptide. High-purity research compound." },
  { id: "tesamorelin", name: "Tesamorelin 10mg (10 vials/kit)",  category: "peptides", price: 368, sale: 288, badge: "sale",     bestseller: false, inStock: true,
    blurb: "GHRH analog. Lyophilized powder, third-party verified." },
  { id: "ipamorelin",  name: "Ipamorelin 5mg (10 vials/kit)",    category: "peptides", price: 132, sale: 108, badge: "sale",     bestseller: false, inStock: true,
    blurb: "Selective growth-hormone secretagogue. Research use only." },
  { id: "sermorelin",  name: "Sermorelin 5mg (10 vials/kit)",    category: "peptides", price: 148, sale: null, badge: null,       bestseller: false, inStock: true,
    blurb: "GHRH (1-29) analog. Batch-tested lyophilized peptide." },
  { id: "pt-141",      name: "PT-141 10mg (10 vials/kit)",       category: "peptides", price: 158, sale: 128, badge: "sale",     bestseller: false, inStock: true,
    blurb: "Melanocortin research peptide. 99%+ purity." },
  { id: "melanotan-2", name: "Melanotan II 10mg (10 vials/kit)", category: "peptides", price: 138, sale: 112, badge: "sale",     bestseller: false, inStock: true,
    blurb: "Melanocortin analog. Lyophilized, research grade." },
  { id: "selank",      name: "N-Acetyl Selank 10mg (10 vials/kit)", category: "peptides", price: 168, sale: null, badge: null,   bestseller: false, inStock: true,
    blurb: "Amidated Selank analog. High-purity lyophilized powder." },
  { id: "semax",       name: "N-Acetyl Semax 10mg (10 vials/kit)",  category: "peptides", price: 178, sale: null, badge: null,   bestseller: false, inStock: true,
    blurb: "Amidated Semax analog. Research compound, batch tested." },
  { id: "nad",         name: "NAD+ 500mg Buffered (10 vials/kit)",  category: "peptides", price: 278, sale: 228, badge: "sale",  bestseller: false, inStock: true,
    blurb: "Buffered nicotinamide adenine dinucleotide. Lab research only." },
  { id: "cagrilintide", name: "Cagrilintide 10mg (10 vials/kit)",   category: "peptides", price: 388, sale: 332, badge: "sale",  bestseller: false, inStock: false,
    blurb: "Amylin analog research peptide. Third-party COA available." },
  { id: "cartalax",    name: "Cartalax 10mg (10 vials/kit)",     category: "peptides", price: 225, sale: 161, badge: "sale",     bestseller: false, inStock: false,
    blurb: "Short peptide bioregulator. Lyophilized, research grade." },
  { id: "thymosin-a1", name: "Thymosin Alpha-1 10mg (10 vials/kit)", category: "peptides", price: 198, sale: null, badge: null,  bestseller: false, inStock: true,
    blurb: "28-amino-acid peptide. Research use only, 99%+ purity." },
  { id: "5-amino-1mq", name: "5-Amino-1MQ 50mg (10 vials/kit)",  category: "peptides", price: 238, sale: 198, badge: "sale",     bestseller: false, inStock: true,
    blurb: "Small-molecule research compound. Batch tested." },

  // ---- Blends ---------------------------------------------------------------
  { id: "blend-recovery", name: "Recovery Blend BPC-157 / TB-500 10mg/10mg (10 vials/kit)", category: "peptides", price: 368, sale: 323, badge: "sale", bestseller: true, inStock: true,
    blurb: "Dual-compound research blend. Lyophilized, verified purity." },
  { id: "blend-glow",     name: "Glow Blend GHK-Cu / KPV 50mg/20mg (10 vials/kit)",         category: "peptides", price: 375, sale: 288, badge: "sale", bestseller: false, inStock: true,
    blurb: "Copper-peptide research blend. Third-party tested." },
  { id: "blend-growth",   name: "Growth Blend Tesamorelin / Ipamorelin 10mg/3mg (10 vials/kit)", category: "peptides", price: 378, sale: 328, badge: "sale", bestseller: false, inStock: true,
    blurb: "GHRH + secretagogue research blend. 99%+ purity." },

  // ---- Aminos ---------------------------------------------------------------
  { id: "lipo-c",   name: "Lipo-C with B12 (10 vials/kit, 100mL total)", category: "aminos", price: 98,  sale: 78, badge: "sale", bestseller: false, inStock: true,
    blurb: "Methionine / inositol / choline with B12. Research solution." },
  { id: "glycine",  name: "Glycine 1000mg (10 vials/kit)",  category: "aminos", price: 68,  sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Reconstitution-ready amino acid. Lab research only." },
  { id: "l-carnitine", name: "L-Carnitine 500mg (10 vials/kit)", category: "aminos", price: 88, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Research-grade amino acid derivative. Batch tested." },

  // ---- Accessories ----------------------------------------------------------
  { id: "bac-water",    name: "Bacteriostatic Water 30mL (0.9% benzyl alcohol)", category: "accessories", price: 18, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Sterile reconstitution solution for laboratory use." },
  { id: "insulin-syr",  name: "Insulin Syringes 31G 0.5mL (100-pack)", category: "accessories", price: 24, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Sterile single-use syringes. Laboratory supplies." },
  { id: "alcohol-pads", name: "Alcohol Prep Pads (200-pack)", category: "accessories", price: 9, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Sterile 70% isopropyl prep pads." },
  { id: "vial-rack",    name: "Vial Storage Rack (50-slot)", category: "accessories", price: 22, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Laboratory vial organization rack." }
];
