/* ============================================================================
   PRODUCT CATALOG — the three cards on the page, in order.

   Each product:
     id        slug, also the DOM id of its card
     cat       catalogue number stamped on the card ("CAT. NO. 001")
     name      display name
     tagline   the "for the …" line, set as an eyebrow
     copy      the rat-effect paragraph
     badge     optional corner badge on the specimen panel
     href      product page, or null for buy-on-card products
     images    gallery images; the first is the card image
     variants  separately purchasable amounts, each with its own Stripe link:
                 { id, label, price, buyUrl? }
               The link comes from window.PAYMENT_LINKS[variant.id] (generated
               by scripts/create-stripe-payment-links.mjs), or a manual
               `buyUrl` set here as an override.

   Products with a page (href) additionally carry:
     spec      rows for the "Additional information" table, [label, value]
     notes     the numbered 01-04 accordions, { n, title, body[] }
     trust     the three checkmark rows in the buy box
     detail    extra compliant paragraph shown under `copy` in Description

   Copy is final per the build brief — effect sentences stay about THE RAT.
   No dosing, timeframes, percentages, or human-use claims.
   ========================================================================== */
window.PRODUCTS = [
  {
    id: "retatrutide",
    cat: "001",
    name: "Retatrutide",
    tagline: "for the rounder rat",
    badge: "BEST SELLER",
    href: "retatrutide.html",
    copy: "Your rat will experience a sudden and dignified loss of interest in the snack corner. Appetite: reduced. Waistline: also reduced. In rodent research, this triple-agonist (GLP-1/GIP/glucagon) is the headline compound for metabolic and body-composition studies. Your rat has never looked better, and your rat knows it.",
    detail: "Supplied as a lyophilized powder in sealed glass vials. Kits contain ten vials at the stated per-vial strength; single vials are available at each strength. Reconstitution requires bacteriostatic water, which is sold separately on this site and is often stacked with a syringe order, because measuring small volumes accurately is the entire job.",
    images: [
      { src: "assets/reta-vial.svg", alt: "Sealed glass vial of lyophilized Retatrutide" },
      { src: "assets/reta-kit.svg",  alt: "Kit of ten sealed Retatrutide vials" },
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
    trust: ["Ships promptly", "Sealed sterile vials", "Definitely for rats"],
    spec: [
      ["Contents", "Retatrutide, lyophilized"],
      ["Form", "Freeze-dried powder, sealed under vacuum"],
      ["Vials per kit", "10 (single-vial options ship as one)"],
      ["Presentation", "Glass vial, rubber stopper, aluminium crimp, flip-off cap"],
      ["Diluent", "Bacteriostatic water — sold separately"],
      ["Storage", "Cold and dark; see section 03"],
      ["Intended use", "Laboratory research. Definitely for rats."]
    ],
    notes: [
      {
        n: "01",
        title: "Preparation & Research Guide",
        body: [
          "Lyophilized peptide is reconstituted with bacteriostatic water. Introduce the diluent slowly, running it down the inside wall of the vial rather than firing it directly onto the powder cake.",
          "Let the vial stand undisturbed until the cake has fully dissolved, swirling gently if needed. Do not shake — agitation is hard on peptides.",
          "Work aseptically throughout: swab the stopper before every entry and use a fresh sterile syringe each time.",
          "Mark the vial with the date it was reconstituted. Material in solution keeps for less time than sealed powder."
        ]
      },
      {
        n: "02",
        title: "Lyophilized Powder Information",
        body: [
          "Material ships as a lyophilized — freeze-dried — powder under vacuum. This is the standard form for peptide storage and transport, and it is far more stable this way than in solution.",
          "The cake may arrive as a compact disc, a thin film, or loose flakes, and may shift or dust the vial wall in transit. All of this is normal and says nothing about the material.",
          "A faint hiss when the stopper is first pierced means the vial is still holding its vacuum, which is what you want."
        ]
      },
      {
        n: "03",
        title: "Storage Recommendations",
        body: [
          "Sealed vials: keep cold and dark, in the original packaging, out of direct light.",
          "Once reconstituted: refrigerate, and keep protected from light.",
          "Avoid repeated freeze-thaw cycles, and avoid leaving vials at ambient temperature for longer than the work requires.",
          "Set aside any vial whose contents have changed in colour, clarity, or appearance."
        ]
      },
      {
        n: "04",
        title: "Vial Cap Instructions",
        body: [
          "Each vial is closed with a rubber stopper, held down by an aluminium crimp, covered by a coloured plastic flip-off disc.",
          "Lift the plastic disc away with a thumb. That part is meant to come off. The aluminium crimp underneath is not.",
          "Do not pry off the crimp or dig out the stopper — the vial is designed to be accessed through the stopper, and stays sterile that way.",
          "Swab the exposed stopper with alcohol and let it dry before each entry."
        ]
      }
    ]
  },
  {
    id: "bac-water",
    cat: "002",
    name: "Bacteriostatic Water",
    tagline: "the unsung hero",
    badge: null,
    href: null,
    copy: "Peptides arrive freeze-dried, as a powder. This sterile water is what turns the powder back into something a laboratory can actually use. Your rat cannot do anything with powder. Every kit on this page needs this. Buy it with the peptides; thank us later.",
    images: [
      { src: "assets/bac-water.svg", alt: "Vial of bacteriostatic water" }
    ],
    variants: [
      { id: "bac-water-10ml",   label: "10mL vial",     price: 9 },
      { id: "bac-water-30ml",   label: "30mL vial",     price: 18 },
      { id: "bac-water-30ml-3", label: "30mL — 3-pack", price: 45 },
      { id: "bac-water-30ml-5", label: "30mL — 5-pack", price: 65 }
    ]
  },
  {
    id: "insulin-syr",
    cat: "003",
    name: "Insulin Syringes",
    tagline: "for measuring tiny things precisely",
    badge: null,
    href: null,
    copy: "Sterile, single-use, and very thin, because the entire job is measuring very small amounts very accurately. A laboratory essential. Your rat will barely look up from his wheel.",
    images: [
      { src: "assets/syringe.svg", alt: "Insulin syringe, 31 gauge, half millilitre" }
    ],
    variants: [
      { id: "insulin-syr-31g-10",  label: "31G 0.5mL, 10-pack",  price: 6 },
      { id: "insulin-syr-31g-50",  label: "31G 0.5mL, 50-pack",  price: 15 },
      { id: "insulin-syr-31g-100", label: "31G 0.5mL, 100-pack", price: 24 },
      { id: "insulin-syr-31g-300", label: "31G 0.5mL, 300-pack", price: 59 }
    ]
  }
];
