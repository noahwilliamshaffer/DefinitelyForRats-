/* ============================================================================
   MAIN — shared across index.html and retatrutide.html.

   Responsibilities:
     · exposes window.RATS, the small shared toolkit (escaping, money, variant
       lookup, payment links, buy buttons, pill groups) used by product-page.js
     · stamps SITE.disclaimer into every [data-disclaimer] element and the year
       into [data-year], so js/site-config.js stays the single source of truth
     · renders the catalogue cards into #product-grid (index.html only)
     · runs the 21+ age gate once per session (sessionStorage), so moving
       between the main page and the product page never re-prompts
   ========================================================================== */
(function () {
  var S = window.SITE;
  var PRODUCTS = window.PRODUCTS || [];

  var byId = {};
  for (var i = 0; i < PRODUCTS.length; i++) byId[PRODUCTS[i].id] = PRODUCTS[i];

  /* ---- Shared helpers ----------------------------------------------------- */
  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function money(n) { return S.currencySymbol + n; }

  function priceRange(p) {
    var lo = p.variants[0].price, hi = lo;
    for (var i = 1; i < p.variants.length; i++) {
      var n = p.variants[i].price;
      if (n < lo) lo = n;
      if (n > hi) hi = n;
    }
    return lo === hi ? money(lo) : money(lo) + " – " + money(hi);
  }

  function variantOf(p, variantId) {
    for (var i = 0; i < p.variants.length; i++) {
      if (p.variants[i].id === variantId) return p.variants[i];
    }
    return null;
  }

  function linkFor(v) {
    return (window.PAYMENT_LINKS && window.PAYMENT_LINKS[v.id]) || v.buyUrl || "";
  }

  // Buy is a real link when the variant has a Payment Link, and a disabled
  // button when it doesn't — never a control that looks live but goes nowhere.
  function buyHtml(v, label, cls) {
    var extra = cls ? " " + cls : "";
    if (!v) {
      return '<button class="btn btn-accent' + extra + '" disabled>' + esc(label) + "</button>";
    }
    var url = linkFor(v);
    if (!url) {
      return '<button class="btn btn-accent' + extra + '" disabled ' +
        'title="Checkout link pending — run scripts/create-stripe-payment-links.mjs">' +
        esc(label) + "</button>";
    }
    return '<a class="btn btn-accent' + extra + '" href="' + esc(url) +
      '" target="_blank" rel="noopener">' + esc(label) + "</a>";
  }

  // Price updates land on the same frame; only the fade is animated.
  function setPrice(el, text) {
    if (!el || el.textContent === text) return;
    el.textContent = text;
    el.classList.remove("is-changed");
    void el.offsetWidth;
    el.classList.add("is-changed");
  }

  function pillsHtml(p, selectedId) {
    var out = "";
    for (var i = 0; i < p.variants.length; i++) {
      var v = p.variants[i];
      var on = v.id === selectedId;
      // Roving tabindex: one tab stop for the group, arrows move within it.
      var tab = on || (!selectedId && i === 0) ? "0" : "-1";
      out += '<button type="button" class="pill" role="radio" aria-checked="' +
        (on ? "true" : "false") + '" tabindex="' + tab + '" data-variant="' +
        esc(v.id) + '">' + esc(v.label) + "</button>";
    }
    return out;
  }

  /* Wire a pill group: click, arrow keys, Home/End. `onSelect` receives the
     variant id. Selection state lives in the DOM (aria-checked). */
  function initPills(group, onSelect) {
    if (!group) return;

    function select(pill) {
      var pills = group.querySelectorAll(".pill");
      for (var i = 0; i < pills.length; i++) {
        var on = pills[i] === pill;
        pills[i].setAttribute("aria-checked", on ? "true" : "false");
        pills[i].tabIndex = on ? 0 : -1;
      }
      onSelect(pill.getAttribute("data-variant"));
    }

    group.addEventListener("click", function (e) {
      var pill = e.target.closest(".pill");
      if (pill) select(pill);
    });

    group.addEventListener("keydown", function (e) {
      var keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
      if (keys.indexOf(e.key) === -1) return;
      var pills = Array.prototype.slice.call(group.querySelectorAll(".pill"));
      var at = pills.indexOf(document.activeElement);
      if (at === -1) at = 0;
      var to;
      if (e.key === "Home") to = 0;
      else if (e.key === "End") to = pills.length - 1;
      else if (e.key === "ArrowRight" || e.key === "ArrowDown") to = (at + 1) % pills.length;
      else to = (at - 1 + pills.length) % pills.length;
      e.preventDefault();
      pills[to].focus();
      select(pills[to]);
    });
  }

  window.RATS = {
    products: PRODUCTS,
    byId: byId,
    esc: esc,
    money: money,
    priceRange: priceRange,
    variantOf: variantOf,
    linkFor: linkFor,
    buyHtml: buyHtml,
    setPrice: setPrice,
    pillsHtml: pillsHtml,
    initPills: initPills
  };

  /* ---- Catalogue cards ---------------------------------------------------- */
  function cardHtml(p) {
    var img = p.images && p.images[0];
    var hasPage = !!p.href;
    var v0 = p.variants[0];

    var panel =
      '<div class="card-panel">' +
      (img ? '<img src="' + esc(img.src) + '" alt="' + esc(img.alt) + '" loading="lazy" />' : "") +
      (p.badge ? '<span class="card-badge">' + esc(p.badge) + "</span>" : "") +
      '<span class="card-cat">CAT. NO. ' + esc(p.cat) + "</span>" +
      "</div>";

    var name = hasPage
      ? '<a href="' + esc(p.href) + '">' + esc(p.name) + "</a>"
      : esc(p.name);

    // Products with a page send you there to choose; supplies are bought here,
    // either straight to Stripe or into the cart.
    var foot = hasPage
      ? '<div class="card-buy">' +
        '<p class="price">' + priceRange(p) + "</p>" +
        '<a class="btn btn-accent" href="' + esc(p.href) + '">Select options</a>' +
        "</div>"
      : '<div class="pills" role="radiogroup" aria-label="' + esc(p.name) + ' amount" data-pills="' + esc(p.id) + '">' +
        pillsHtml(p, v0.id) + "</div>" +
        '<div class="card-buy">' +
        '<p class="price" data-price>' + money(v0.price) + "</p>" +
        "</div>" +
        '<div class="card-actions">' +
        '<button type="button" class="btn btn-ghost" data-add="' + esc(v0.id) + '">Add to cart</button>' +
        buyHtml(v0, "Buy", "card-cta") +
        "</div>";

    return (
      '<article class="card" id="product-' + esc(p.id) + '">' +
      panel +
      '<div class="card-body">' +
      '<h3 class="card-name">' + name + "</h3>" +
      '<p class="eyebrow card-tag">' + esc(p.tagline) + "</p>" +
      '<p class="card-copy">' + esc(p.copy) + "</p>" +
      '<div class="card-foot">' + foot + "</div>" +
      "</div></article>"
    );
  }

  function renderGrid(grid) {
    var html = "";
    for (var i = 0; i < PRODUCTS.length; i++) html += cardHtml(PRODUCTS[i]);
    grid.innerHTML = html;

    var groups = grid.querySelectorAll("[data-pills]");
    for (var g = 0; g < groups.length; g++) {
      (function (group) {
        var p = byId[group.getAttribute("data-pills")];
        var host = group.closest(".card");
        initPills(group, function (variantId) {
          var v = variantOf(p, variantId);
          if (!v) return;
          setPrice(host.querySelector("[data-price]"), money(v.price));
          host.querySelector(".card-cta").outerHTML = buyHtml(v, "Buy", "card-cta");
          host.querySelector("[data-add]").setAttribute("data-add", v.id);
        });
      })(groups[g]);
    }
  }

  /* ---- Age gate ----------------------------------------------------------- */
  var KEY = "ageVerified";

  function ageGateHtml() {
    return (
      '<div class="agegate" id="agegate" role="dialog" aria-modal="true" aria-labelledby="agegate-title">' +
      '<div class="agegate-box">' +
      '<p class="eyebrow">' + esc(S.brand) + "</p>" +
      '<h2 id="agegate-title">Age verification</h2>' +
      "<p>This site sells products intended strictly for laboratory research. " +
      "You must be " + S.ageGate + " years or older to enter.</p>" +
      '<div class="agegate-actions">' +
      '<button type="button" class="btn btn-accent" data-age="yes">I am ' + S.ageGate + " or older</button>" +
      '<button type="button" class="btn btn-ghost" data-age="no">Exit</button>' +
      "</div>" +
      '<p class="agegate-fine">' + esc(S.disclaimer) + "</p>" +
      "</div></div>"
    );
  }

  function openAgeGate() {
    var holder = document.createElement("div");
    holder.innerHTML = ageGateHtml();
    var gate = holder.firstChild;
    document.body.appendChild(gate);
    document.body.classList.add("is-locked");

    var focusable = gate.querySelectorAll("button");
    focusable[0].focus();

    // Keep Tab inside the dialog; Escape is deliberately not an exit.
    gate.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    gate.addEventListener("click", function (e) {
      var b = e.target.closest("[data-age]");
      if (!b) return;
      if (b.getAttribute("data-age") === "yes") {
        try { sessionStorage.setItem(KEY, "1"); } catch (err) { /* private mode */ }
        gate.remove();
        document.body.classList.remove("is-locked");
      } else {
        window.location.href = "https://www.google.com";
      }
    });
  }

  function verified() {
    try { return sessionStorage.getItem(KEY) === "1"; } catch (err) { return false; }
  }

  /* ---- Boot --------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    var d = document.querySelectorAll("[data-disclaimer]");
    for (var i = 0; i < d.length; i++) d[i].textContent = S.disclaimer;

    var y = document.querySelector("[data-year]");
    if (y) y.textContent = new Date().getFullYear();

    var grid = document.getElementById("product-grid");
    if (grid) renderGrid(grid);

    if (!verified()) openAgeGate();
  });
})();
