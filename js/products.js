/* ============================================================================
   PRODUCT CATALOG — every product, in display order.

   Each product:
     id        slug, also the DOM id of its card
     cat       catalogue number stamped on the card ("CAT. NO. 001")
     name      display name
     category  eyebrow above the name ("Research peptide")
     copy      short technical summary: card text and product-page lede
     badge     optional corner badge on the specimen panel
     href      product page (every product has one)
     images    gallery images; the first is the card image
     variants  separately purchasable amounts: { id, label, price, buyUrl? }
               Variant ids are what the checkout functions price from — never
               rename one without re-checking api/ and js/payment-links.js.
     coa       certificate of analysis for the current batch, or null while
               it is pending: { batch, date: "YYYY-MM-DD", file: "assets/coa/…pdf" }

   Product pages additionally carry:
     spec      rows for the "Additional information" table, [label, value]
     notes     the numbered 01-04 accordions, { n, title, body[] }
     trust     the three checkmark rows in the buy box
     detail    extra paragraph shown under `copy` in the Description tab

   Copy rules (processor underwriting — see CLAUDE.md): scientific and
   technical only. No health, weight, performance or outcome claims, no
   dosing, protocols, preparation steps, "stacks", testimonials, or any
   suggestion of human or animal use. Specs state only what the batch COA
   supports — no purity figure here; purity lives on the COA.
   ========================================================================== */
window.PRODUCTS = [
  {
    id: "retatrutide",
    cat: "001",
    name: "Retatrutide",
    category: "Research peptide",
    badge: null,
    href: "retatrutide.html",
    copy: "Retatrutide (LY3437943) is a synthetic peptide characterised as an agonist at the GIP, GLP-1, and glucagon receptors. Supplied as a lyophilized powder in sealed glass vials for laboratory and analytical research.",
    detail: "Each vial is filled by mass at the stated strength and sealed under vacuum. Kits contain ten vials of the same strength; single vials are available at every strength. Identity and purity are reported per batch on the certificate of analysis. Bacteriostatic water and laboratory syringes are listed separately.",
    images: [
      { src: "assets/reta-vial.svg", alt: "Sealed glass vial of lyophilized retatrutide" },
      { src: "assets/reta-kit.svg",  alt: "Kit of ten sealed retatrutide vials" },
      { src: "assets/reta-cap.svg",  alt: "Cross-section of the vial closure: flip-off cap, aluminium crimp, rubber stopper" }
    ],
    variants: [
      { id: "retatrutide-10mg-1", label: "10mg Single Vial",  price: 49 },
      { id: "retatrutide-10mg",   label: "10mg Kit (100mg)",  price: 268 },
      { id: "retatrutide-24mg-1", label: "24mg Single Vial",  price: 89 },
      { id: "retatrutide-24mg",   label: "24mg Kit (240mg)",  price: 498 },
      { id: "retatrutide-48mg-1", label: "48mg Single Vial",  price: 139 },
      { id: "retatrutide-48mg",   label: "48mg Kit (480mg)",  price: 828 }
    ],
    coa: null,
    trust: ["Batch certificate of analysis", "Sealed under vacuum", "Research use only"],
    // Identifiers are the published values for retatrutide. Confirm each one
    // against the supplier's COA before going live.
    spec: [
      ["Compound", "Retatrutide"],
      ["Synonym", "LY3437943"],
      ["CAS number", "2381089-83-2"],
      ["Molecular formula", "C221H342N46O68"],
      ["Molecular weight", "4731.3 g/mol"],
      ["Form", "Lyophilized powder, sealed under vacuum"],
      ["Strengths", "10mg, 24mg, 48mg per vial"],
      ["Presentation", "Glass vial, rubber stopper, aluminium crimp, flip-off cap"],
      ["Purity", "Reported per batch on the certificate of analysis"],
      ["Storage", "Cold and dark; see section 03"],
      ["Intended use", "Laboratory research only. Not for human or animal consumption."]
    ],
    notes: [
      {
        n: "01",
        title: "Compound Identity",
        body: [
          "Retatrutide, also designated LY3437943, is a synthetic peptide characterised in the literature as a single molecule with agonist activity at the glucose-dependent insulinotropic polypeptide (GIP), glucagon-like peptide-1 (GLP-1), and glucagon receptors.",
          "Identity and purity for each batch, and the analytical methods used to determine them, are reported on the certificate of analysis for that batch."
        ]
      },
      {
        n: "02",
        title: "Lyophilized Form",
        body: [
          "Material ships as a lyophilized — freeze-dried — powder under vacuum. This is the standard form for peptide storage and transport, and it is considerably more stable than material in solution.",
          "The cake may present as a compact disc, a thin film, or loose flakes, and may shift or dust the vial wall in transit. None of this indicates a change in the material."
        ]
      },
      {
        n: "03",
        title: "Storage",
        body: [
          "Sealed vials: store cold and dark, in the original packaging, out of direct light.",
          "Avoid repeated freeze-thaw cycles and extended periods at ambient temperature.",
          "Set aside any vial whose contents have changed in colour or appearance, or whose seal is not intact."
        ]
      },
      {
        n: "04",
        title: "Vial Closure",
        body: [
          "Each vial is closed with a rubber stopper, held by an aluminium crimp, under a plastic flip-off disc.",
          "The flip-off disc is designed to be removed. The aluminium crimp and the stopper are not; the vial is designed to be accessed through the stopper so that the closure stays intact."
        ]
      }
    ]
  },
  {
    id: "bac-water",
    cat: "002",
    name: "Bacteriostatic Water",
    category: "Laboratory reagent",
    badge: null,
    href: "bacteriostatic-water.html",
    copy: "Sterile water containing 0.9% benzyl alcohol as a bacteriostatic preservative. A laboratory diluent for reagent preparation, supplied in sealed multi-entry glass vials.",
    detail: "The benzyl alcohol inhibits bacterial growth, which is what distinguishes bacteriostatic water from preservative-free sterile water and allows a vial to be entered more than once. Supplied as 10mL and 30mL vials and in multi-vial packs.",
    images: [
      { src: "assets/bac-water.svg", alt: "Vial of bacteriostatic water" },
      { src: "assets/reta-cap.svg",  alt: "Cross-section of the vial closure: flip-off cap, aluminium crimp, rubber stopper" }
    ],
    variants: [
      { id: "bac-water-10ml",   label: "10mL vial",     price: 9 },
      { id: "bac-water-30ml",   label: "30mL vial",     price: 18 },
      { id: "bac-water-30ml-3", label: "30mL — 3-pack", price: 45 },
      { id: "bac-water-30ml-5", label: "30mL — 5-pack", price: 65 }
    ],
    coa: null,
    trust: ["Batch certificate of analysis", "Sealed sterile vials", "Research use only"],
    spec: [
      ["Composition", "Sterile water, 0.9% benzyl alcohol"],
      ["Form", "Solution"],
      ["Volume", "10mL or 30mL per vial, by option"],
      ["Presentation", "Glass vial, rubber stopper, aluminium crimp, flip-off cap"],
      ["Application", "Laboratory diluent"],
      ["Storage", "Room temperature and dark; see section 03"],
      ["Intended use", "Laboratory research only. Not for human or animal consumption."]
    ],
    notes: [
      {
        n: "01",
        title: "Composition",
        body: [
          "Bacteriostatic water is sterile water containing 0.9% benzyl alcohol. The benzyl alcohol is a bacteriostatic agent: it inhibits bacterial growth rather than eliminating organisms already present.",
          "This preservative is the practical difference from preservative-free sterile water, which is intended for a single entry."
        ]
      },
      {
        n: "02",
        title: "Sterility",
        body: [
          "Each vial is sterile and sealed at the point of manufacture. Sterility is assured only while the seal is intact.",
          "Set aside any vial whose seal is broken or whose contents are cloudy, discoloured, or carrying visible particles."
        ]
      },
      {
        n: "03",
        title: "Storage",
        body: [
          "Unopened vials: room temperature, out of direct light, in the original packaging.",
          "Opened vials: refrigerate, protect from light, and record the date of first entry on the label.",
          "Do not freeze."
        ]
      },
      {
        n: "04",
        title: "Vial Closure",
        body: [
          "Each vial is closed with a rubber stopper, held by an aluminium crimp, under a plastic flip-off disc.",
          "The flip-off disc is designed to be removed. The aluminium crimp and the stopper are not; the vial is designed to be accessed through the stopper so that the closure stays intact."
        ]
      }
    ]
  },
  {
    id: "insulin-syr",
    cat: "003",
    name: "Laboratory Syringes",
    category: "Laboratory supply",
    badge: null,
    href: "lab-syringes.html",
    copy: "Sterile, single-use 0.5mL syringes with a fixed 31-gauge needle and a barrel graduated for precise measurement of small volumes. Individually sealed.",
    detail: "Each syringe is individually wrapped and sterile until opened. Supplied in packs of 10, 50, 100, and 300.",
    images: [
      { src: "assets/syringe.svg", alt: "Syringe, 31 gauge, half millilitre" }
    ],
    variants: [
      { id: "insulin-syr-31g-10",  label: "31G 0.5mL, 10-pack",  price: 6 },
      { id: "insulin-syr-31g-50",  label: "31G 0.5mL, 50-pack",  price: 15 },
      { id: "insulin-syr-31g-100", label: "31G 0.5mL, 100-pack", price: 24 },
      { id: "insulin-syr-31g-300", label: "31G 0.5mL, 300-pack", price: 59 }
    ],
    coa: null,
    trust: ["Individually sealed", "Sterile, single use", "Research use only"],
    spec: [
      ["Contents", "Sterile syringes with fixed needle"],
      ["Gauge", "31G"],
      ["Barrel volume", "0.5mL"],
      ["Graduations", "Printed along the barrel"],
      ["Pack size", "10, 50, 100, or 300, by option"],
      ["Sterility", "Individually sealed, single use"],
      ["Intended use", "Laboratory research only."]
    ],
    notes: [
      {
        n: "01",
        title: "Specifications",
        body: [
          "31G describes the needle's outside diameter. Gauge numbers run inversely: the higher the number, the finer the needle.",
          "The half-millilitre barrel is graduated along its length for accurate reading of small volumes."
        ]
      },
      {
        n: "02",
        title: "Sterility",
        body: [
          "Each syringe is sterile until its wrapper is opened and is intended for a single use. Do not re-sterilise or re-use.",
          "Inspect the wrapper before opening, and set aside anything that arrived torn, damp, or already opened."
        ]
      },
      {
        n: "03",
        title: "Storage",
        body: [
          "Store in a cool, dry place in the original packaging, out of direct light and away from heat sources.",
          "Keep wrappers sealed until use."
        ]
      },
      {
        n: "04",
        title: "Disposal",
        body: [
          "Used syringes are sharps waste and belong in a rigid, puncture-resistant sharps container — never in ordinary waste or recycling.",
          "Sharps disposal is governed by local regulations. Follow those that apply in your jurisdiction."
        ]
      }
    ]
  }
];
