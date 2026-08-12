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
    href: "bacteriostatic-water.html",
    copy: "Peptides arrive freeze-dried, as a powder. This sterile water is what turns the powder back into something a laboratory can actually use. Your rat cannot do anything with powder. Every kit on this page needs this. Buy it with the peptides; thank us later.",
    detail: "Supplied in sealed glass vials with 0.9% benzyl alcohol, which is the bacteriostatic part: it is what allows a vial to be entered more than once. Sold as 10mL and 30mL vials and in multi-vial packs. Often stacked with a syringe order, for reasons that become obvious the moment the powder arrives.",
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
    trust: ["Ships promptly", "Sealed sterile vials", "Definitely for rats"],
    spec: [
      ["Contents", "Sterile water with 0.9% benzyl alcohol"],
      ["Form", "Solution"],
      ["Volume", "10mL or 30mL per vial, by option"],
      ["Presentation", "Glass vial, rubber stopper, aluminium crimp, flip-off cap"],
      ["Used for", "Reconstituting lyophilized peptides"],
      ["Storage", "Room temperature and dark; see section 03"],
      ["Intended use", "Laboratory research. Definitely for rats."]
    ],
    notes: [
      {
        n: "01",
        title: "Preparation & Handling",
        body: [
          "Swab the stopper with alcohol and let it dry before every entry. Use a fresh sterile syringe each time.",
          "When reconstituting a lyophilized peptide, run the diluent slowly down the inside wall of the vial rather than firing it straight onto the powder cake.",
          "Let the vial stand until the cake has dissolved, swirling gently if needed. Do not shake.",
          "Mark the vial with the date of first entry."
        ]
      },
      {
        n: "02",
        title: "What Bacteriostatic Water Is",
        body: [
          "Bacteriostatic water is sterile water containing 0.9% benzyl alcohol. The benzyl alcohol is a bacteriostatic agent — it inhibits bacterial growth rather than killing what is already there.",
          "That is the practical difference from sterile water for injection, which carries no preservative and is intended for a single entry. The preservative is what allows a bacteriostatic vial to be entered more than once.",
          "It is a diluent. It does nothing on its own — it exists to put freeze-dried material back into solution."
        ]
      },
      {
        n: "03",
        title: "Storage Recommendations",
        body: [
          "Unopened vials: room temperature, out of direct light, in the original packaging.",
          "After first entry: refrigerate, keep protected from light, and note the date on the vial.",
          "Do not freeze.",
          "Set aside any vial whose contents are cloudy, discoloured, or carrying visible particles, and any vial whose seal is not intact."
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
    id: "insulin-syr",
    cat: "003",
    name: "Insulin Syringes",
    tagline: "for measuring tiny things precisely",
    badge: null,
    href: "insulin-syringes.html",
    copy: "Sterile, single-use, and very thin, because the entire job is measuring very small amounts very accurately. A laboratory essential. Your rat will barely look up from his wheel.",
    detail: "Sterile single-use syringes with a fixed 31-gauge needle and a half-millilitre barrel graduated in units. Sold in packs of 10, 50, 100, and 300. Often stacked with bacteriostatic water, since neither one is much use to a laboratory without the other.",
    images: [
      { src: "assets/syringe.svg", alt: "Insulin syringe, 31 gauge, half millilitre" }
    ],
    variants: [
      { id: "insulin-syr-31g-10",  label: "31G 0.5mL, 10-pack",  price: 6 },
      { id: "insulin-syr-31g-50",  label: "31G 0.5mL, 50-pack",  price: 15 },
      { id: "insulin-syr-31g-100", label: "31G 0.5mL, 100-pack", price: 24 },
      { id: "insulin-syr-31g-300", label: "31G 0.5mL, 300-pack", price: 59 }
    ],
    trust: ["Ships promptly", "Individually sealed, single use", "Definitely for rats"],
    spec: [
      ["Contents", "Sterile syringes with fixed needle"],
      ["Gauge", "31G"],
      ["Barrel volume", "0.5 mL"],
      ["Graduations", "Unit markings along the barrel"],
      ["Pack size", "10, 50, 100, or 300, by option"],
      ["Sterility", "Individually sealed, single use"],
      ["Intended use", "Laboratory research. Definitely for rats."]
    ],
    notes: [
      {
        n: "01",
        title: "Handling",
        body: [
          "Each syringe is sterile until its wrapper is opened, and is intended for a single use. Do not re-sterilise or re-use one.",
          "Check the wrapper before opening. Set aside anything that arrived torn, damp, or already opened.",
          "Do not touch the needle or the plunger shaft, and leave the cap on until the moment of use.",
          "Do not attempt to recap a used needle — that is where most sharps injuries happen. Go straight to the sharps container."
        ]
      },
      {
        n: "02",
        title: "Gauge & Graduations",
        body: [
          "31G describes the needle's outside diameter. The gauge number runs backwards: the higher the number, the thinner the needle.",
          "The barrel holds half a millilitre and is graduated in units along its length, which is what makes small volumes readable rather than guessed at.",
          "Draw slowly, and read the graduation at the leading edge of the plunger stopper with the barrel at eye level."
        ]
      },
      {
        n: "03",
        title: "Storage Recommendations",
        body: [
          "Store in a cool, dry place in the original packaging, out of direct light.",
          "Keep wrappers sealed until use — an opened wrapper is an unsterile syringe.",
          "Keep away from heat sources; the barrel and plunger are plastic."
        ]
      },
      {
        n: "04",
        title: "Disposal",
        body: [
          "Used syringes are sharps waste. They belong in a rigid, puncture-resistant sharps container, never in ordinary waste or recycling.",
          "Do not overfill the container, and seal it before it is full.",
          "Disposal of sharps is governed by local regulations. Follow whatever applies in your jurisdiction."
        ]
      }
    ]
  }
];
