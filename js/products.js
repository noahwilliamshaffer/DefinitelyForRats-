/* ============================================================================
   PRODUCT CATALOG — edit this array to manage what appears in the store.
   Placeholder listings using generic research-compound names (which are not
   trademarks). Replace names, prices, and copy with your own. Prices are
   illustrative only.

   PAYMENTS: when SITE.payment.provider === "stripe", add a `buyUrl` to each
   product — the Stripe Payment Link you created for it at
   dashboard.stripe.com/payment-links. Example shown on the first item below.
   (Snipcart mode needs no per-product URL — it uses id/name/price directly.)

   Fields: id, name, category (peptides|aminos|accessories), price, sale (or
   null), badge, bestseller, inStock, blurb, optional buyUrl.
   ========================================================================== */
window.PRODUCTS = [
  /* ---- Repair & recovery peptides ---------------------------------------- */
  { id: "bpc-157", name: "BPC-157 10mg (10 vials/kit)", category: "peptides", price: 178, sale: 152, badge: "sale", bestseller: true, inStock: true,
    buyUrl: "", /* e.g. "https://buy.stripe.com/xxxxxxxx" */
    blurb: "Stable gastric pentadecapeptide. Lyophilized, 99%+ purity." },
  { id: "tb-500", name: "TB-500 10mg (10 vials/kit)", category: "peptides", price: 168, sale: 138, badge: "sale", bestseller: true, inStock: true,
    blurb: "Thymosin Beta-4 fragment. Research grade, batch tested." },
  { id: "tb4", name: "Thymosin Beta-4 (TB4) 10mg (10 vials/kit)", category: "peptides", price: 198, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Full-length TB4 peptide. Lyophilized, third-party verified." },
  { id: "tb-500-frag", name: "TB-500 Fragment 17-23 10mg (10 vials/kit)", category: "peptides", price: 148, sale: 128, badge: "sale", bestseller: false, inStock: true,
    blurb: "Active TB-500 fragment. High-purity research compound." },
  { id: "ghk-cu", name: "GHK-Cu 50mg (10 vials/kit)", category: "peptides", price: 170, sale: 138, badge: "sale", bestseller: true, inStock: true,
    blurb: "Copper tripeptide-1, lyophilized. Multiple variants available." },
  { id: "kpv", name: "KPV 10mg (10 vials/kit)", category: "peptides", price: 128, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Alpha-MSH tripeptide fragment. Batch tested, 99%+ purity." },
  { id: "ll-37", name: "LL-37 5mg (10 vials/kit)", category: "peptides", price: 188, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Cathelicidin-derived research peptide. Lyophilized powder." },
  { id: "pda", name: "PDA (Pentadeca Arginate) 10mg (10 vials/kit)", category: "peptides", price: 168, sale: 148, badge: "sale", bestseller: false, inStock: true,
    blurb: "Pentadeca arginate research peptide. Third-party COA." },
  { id: "mots-c", name: "MOTS-C 10mg (10 vials/kit)", category: "peptides", price: 248, sale: 188, badge: "sale", bestseller: true, inStock: true,
    blurb: "Mitochondrial-derived peptide. High-purity research compound." },

  /* ---- Growth-hormone secretagogues -------------------------------------- */
  { id: "tesamorelin", name: "Tesamorelin 10mg (10 vials/kit)", category: "peptides", price: 368, sale: 288, badge: "sale", bestseller: false, inStock: true,
    blurb: "GHRH analog. Lyophilized powder, third-party verified." },
  { id: "ipamorelin", name: "Ipamorelin 5mg (10 vials/kit)", category: "peptides", price: 132, sale: 108, badge: "sale", bestseller: false, inStock: true,
    blurb: "Selective growth-hormone secretagogue. Research use only." },
  { id: "cjc-1295-dac", name: "CJC-1295 with DAC 5mg (10 vials/kit)", category: "peptides", price: 158, sale: 132, badge: "sale", bestseller: false, inStock: true,
    blurb: "Long-acting GHRH analog with DAC. Batch tested." },
  { id: "cjc-1295-no-dac", name: "CJC-1295 no DAC (Mod GRF 1-29) 5mg (10 vials/kit)", category: "peptides", price: 138, sale: 118, badge: "sale", bestseller: false, inStock: true,
    blurb: "Modified GRF (1-29). Lyophilized research peptide." },
  { id: "sermorelin", name: "Sermorelin 5mg (10 vials/kit)", category: "peptides", price: 148, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "GHRH (1-29) analog. Batch-tested lyophilized peptide." },
  { id: "hexarelin", name: "Hexarelin 5mg (10 vials/kit)", category: "peptides", price: 142, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Growth-hormone-releasing hexapeptide. Research grade." },
  { id: "ghrp-2", name: "GHRP-2 10mg (10 vials/kit)", category: "peptides", price: 118, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Growth-hormone-releasing peptide-2. 99%+ purity." },
  { id: "ghrp-6", name: "GHRP-6 10mg (10 vials/kit)", category: "peptides", price: 118, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Growth-hormone-releasing peptide-6. Lyophilized." },
  { id: "hgh-frag", name: "HGH Fragment 176-191 5mg (10 vials/kit)", category: "peptides", price: 138, sale: 118, badge: "sale", bestseller: false, inStock: true,
    blurb: "Somatropin fragment 176-191. Research compound." },
  { id: "igf-1-lr3", name: "IGF-1 LR3 1mg (10 vials/kit)", category: "peptides", price: 188, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Long-arg-3 IGF-1 analog. High-purity research peptide." },
  { id: "igf-1-des", name: "IGF-1 DES 1mg (10 vials/kit)", category: "peptides", price: 178, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "DES(1-3) IGF-1 research peptide. Batch tested." },
  { id: "follistatin-344", name: "Follistatin-344 1mg (10 vials/kit)", category: "peptides", price: 268, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Follistatin research protein. Lyophilized, verified." },
  { id: "aod-9604", name: "AOD-9604 5mg (10 vials/kit)", category: "peptides", price: 148, sale: 128, badge: "sale", bestseller: false, inStock: true,
    blurb: "Modified HGH fragment analog. Research grade." },

  /* ---- Metabolic / GLP-class research compounds -------------------------- */
  { id: "semaglutide", name: "Semaglutide 10mg (10 vials/kit)", category: "peptides", price: 258, sale: 198, badge: "sale", bestseller: true, inStock: true,
    blurb: "GLP-1 receptor research peptide. Third-party COA." },
  { id: "tirzepatide", name: "Tirzepatide 10mg (10 vials/kit)", category: "peptides", price: 298, sale: 238, badge: "sale", bestseller: true, inStock: true,
    blurb: "Dual GIP/GLP-1 research peptide. 99%+ purity." },
  { id: "retatrutide", name: "Retatrutide 10mg (10 vials/kit)", category: "peptides", price: 328, sale: 268, badge: "sale", bestseller: false, inStock: true,
    blurb: "Triple-agonist research peptide. Lyophilized powder." },
  { id: "survodutide", name: "Survodutide 10mg (10 vials/kit)", category: "peptides", price: 348, sale: 288, badge: "sale", bestseller: false, inStock: true,
    blurb: "GCG/GLP-1 research peptide. Batch tested." },
  { id: "cagrilintide", name: "Cagrilintide 10mg (10 vials/kit)", category: "peptides", price: 388, sale: 332, badge: "sale", bestseller: false, inStock: false,
    blurb: "Amylin analog research peptide. Third-party COA available." },
  { id: "mazdutide", name: "Mazdutide 10mg (10 vials/kit)", category: "peptides", price: 318, sale: null, badge: null, bestseller: false, inStock: false,
    blurb: "GLP-1/GCG research peptide. Lyophilized, verified." },
  { id: "5-amino-1mq", name: "5-Amino-1MQ 50mg (10 vials/kit)", category: "peptides", price: 238, sale: 198, badge: "sale", bestseller: false, inStock: true,
    blurb: "Small-molecule research compound. Batch tested." },
  { id: "slu-pp-332", name: "SLU-PP-332 10mg (10 vials/kit)", category: "peptides", price: 178, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "ERR-agonist research compound. Lyophilized." },

  /* ---- Cognitive / neuro research peptides ------------------------------- */
  { id: "selank", name: "N-Acetyl Selank Amidate 10mg (10 vials/kit)", category: "peptides", price: 168, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Amidated Selank analog. High-purity lyophilized powder." },
  { id: "semax", name: "N-Acetyl Semax Amidate 10mg (10 vials/kit)", category: "peptides", price: 178, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Amidated Semax analog. Research compound, batch tested." },
  { id: "dsip", name: "DSIP 5mg (10 vials/kit)", category: "peptides", price: 118, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Delta sleep-inducing peptide. Research grade." },
  { id: "snap-8", name: "Snap-8 20mg (10 vials/kit)", category: "peptides", price: 138, sale: 118, badge: "sale", bestseller: false, inStock: true,
    blurb: "Acetyl octapeptide research compound. Lyophilized." },
  { id: "epithalon", name: "Epithalon (Epitalon) 10mg (10 vials/kit)", category: "peptides", price: 128, sale: 108, badge: "sale", bestseller: false, inStock: true,
    blurb: "Tetrapeptide bioregulator. Research use only." },
  { id: "pinealon", name: "Pinealon 10mg (10 vials/kit)", category: "peptides", price: 118, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Short peptide bioregulator. Batch tested." },
  { id: "vip", name: "VIP 10mg (10 vials/kit)", category: "peptides", price: 158, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Vasoactive intestinal peptide. Lyophilized research compound." },
  { id: "thymosin-a1", name: "Thymosin Alpha-1 10mg (10 vials/kit)", category: "peptides", price: 198, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "28-amino-acid peptide. Research use only, 99%+ purity." },

  /* ---- Melanocortin / reproductive research peptides --------------------- */
  { id: "pt-141", name: "PT-141 10mg (10 vials/kit)", category: "peptides", price: 158, sale: 128, badge: "sale", bestseller: false, inStock: true,
    blurb: "Melanocortin research peptide. 99%+ purity." },
  { id: "melanotan-2", name: "Melanotan II 10mg (10 vials/kit)", category: "peptides", price: 138, sale: 112, badge: "sale", bestseller: false, inStock: true,
    blurb: "Melanocortin analog. Lyophilized, research grade." },
  { id: "kisspeptin-10", name: "Kisspeptin-10 10mg (10 vials/kit)", category: "peptides", price: 148, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Kisspeptin research peptide. Batch tested." },
  { id: "gonadorelin", name: "Gonadorelin 10mg (10 vials/kit)", category: "peptides", price: 128, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "GnRH research peptide. Lyophilized powder." },
  { id: "oxytocin", name: "Oxytocin 10mg (10 vials/kit)", category: "peptides", price: 118, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Nonapeptide research compound. 99%+ purity." },

  /* ---- Longevity / bioregulators ----------------------------------------- */
  { id: "nad-500", name: "NAD+ 500mg Buffered (10 vials/kit)", category: "peptides", price: 278, sale: 228, badge: "sale", bestseller: false, inStock: true,
    blurb: "Buffered nicotinamide adenine dinucleotide. Lab research only." },
  { id: "nad-250", name: "NAD+ 250mg Buffered (10 vials/kit)", category: "peptides", price: 178, sale: 148, badge: "sale", bestseller: false, inStock: true,
    blurb: "Buffered NAD+, research grade. Third-party tested." },
  { id: "glutathione", name: "Glutathione 600mg (10 vials/kit)", category: "peptides", price: 128, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Reduced glutathione research solution. Batch tested." },
  { id: "cartalax", name: "Cartalax 10mg (10 vials/kit)", category: "peptides", price: 225, sale: 161, badge: "sale", bestseller: false, inStock: false,
    blurb: "Short peptide bioregulator. Lyophilized, research grade." },
  { id: "bronchogen", name: "Bronchogen 10mg (10 vials/kit)", category: "peptides", price: 158, sale: null, badge: null, bestseller: false, inStock: false,
    blurb: "Peptide bioregulator. Research use only." },

  /* ---- Research blends (generic descriptive names) ----------------------- */
  { id: "blend-recovery", name: "Recovery Blend BPC-157 / TB-500 10mg/10mg (10 vials/kit)", category: "peptides", price: 368, sale: 323, badge: "sale", bestseller: true, inStock: true,
    blurb: "Dual-compound research blend. Lyophilized, verified purity." },
  { id: "blend-glow", name: "Glow Blend GHK-Cu / KPV 50mg/20mg (10 vials/kit)", category: "peptides", price: 375, sale: 288, badge: "sale", bestseller: false, inStock: true,
    blurb: "Copper-peptide research blend. Third-party tested." },
  { id: "blend-growth", name: "Growth Blend Tesamorelin / Ipamorelin 10mg/3mg (10 vials/kit)", category: "peptides", price: 378, sale: 328, badge: "sale", bestseller: false, inStock: true,
    blurb: "GHRH + secretagogue research blend. 99%+ purity." },
  { id: "blend-synergy", name: "Synergy Blend CJC-1295 / Ipamorelin 5mg/5mg (10 vials/kit)", category: "peptides", price: 198, sale: 168, badge: "sale", bestseller: false, inStock: true,
    blurb: "GHRH + GHRP research blend. Batch tested." },
  { id: "blend-wellness", name: "Wellness Blend BPC-157 / TB-500 / KPV (10 vials/kit)", category: "peptides", price: 398, sale: 348, badge: "sale", bestseller: false, inStock: true,
    blurb: "Triple-compound research blend. Lyophilized, verified." },
  { id: "blend-cognitive", name: "Cognitive Blend Selank / Semax 10mg/10mg (10 vials/kit)", category: "peptides", price: 278, sale: 238, badge: "sale", bestseller: false, inStock: true,
    blurb: "Dual nootropic research blend. Third-party COA." },

  /* ---- Aminos ------------------------------------------------------------ */
  { id: "lipo-c", name: "Lipo-C with B12 (10 vials/kit, 100mL total)", category: "aminos", price: 98, sale: 78, badge: "sale", bestseller: false, inStock: true,
    blurb: "Methionine / inositol / choline with B12. Research solution." },
  { id: "glycine", name: "Glycine 1000mg (10 vials/kit)", category: "aminos", price: 68, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Reconstitution-ready amino acid. Lab research only." },
  { id: "l-carnitine", name: "L-Carnitine 500mg (10 vials/kit)", category: "aminos", price: 88, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Research-grade amino acid derivative. Batch tested." },
  { id: "taurine", name: "Taurine 1000mg (10 vials/kit)", category: "aminos", price: 62, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Amino sulfonic acid research solution. Lab use only." },

  /* ---- Accessories ------------------------------------------------------- */
  { id: "bac-water", name: "Bacteriostatic Water 30mL (0.9% benzyl alcohol)", category: "accessories", price: 18, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Sterile reconstitution solution for laboratory use." },
  { id: "insulin-syr", name: "Insulin Syringes 31G 0.5mL (100-pack)", category: "accessories", price: 24, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Sterile single-use syringes. Laboratory supplies." },
  { id: "alcohol-pads", name: "Alcohol Prep Pads (200-pack)", category: "accessories", price: 9, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Sterile 70% isopropyl prep pads." },
  { id: "vial-rack", name: "Vial Storage Rack (50-slot)", category: "accessories", price: 22, sale: null, badge: null, bestseller: false, inStock: true,
    blurb: "Laboratory vial organization rack." }
];
