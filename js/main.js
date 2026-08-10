/* ============================================================================
   MAIN — renders the six product cards into #product-grid, keeps the price
   and Buy link in sync with the selected variant, and runs the age gate.
   ========================================================================== */
(function () {
  var S = window.SITE;

  var byId = {};
  window.PRODUCTS.forEach(function (p) { byId[p.id] = p; });

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function money(n) { return S.currencySymbol + n; }

  function variantOf(p, variantId) {
    for (var i = 0; i < p.variants.length; i++) {
      if (p.variants[i].id === variantId) return p.variants[i];
    }
    return p.variants[0];
  }

  function linkFor(v) {
    return (window.PAYMENT_LINKS && window.PAYMENT_LINKS[v.id]) || v.buyUrl || "";
  }

  // Every variant is addable to the cart. When a variant also has a hosted
  // Payment Link, a secondary "Buy now" skips the cart entirely.
  function buyHtml(v) {
    var url = linkFor(v);
    return (
      '<div class="card-actions" data-buy>' +
      '<button class="btn add" data-add="' + esc(v.id) + '">Add to cart</button>' +
      (url
        ? '<a class="btn btn-ghost buynow" href="' + esc(url) + '">Buy now</a>'
        : "") +
      "</div>"
    );
  }

  function card(p) {
    var v0 = p.variants[0];
    var options = p.variants.map(function (v) {
      return '<option value="' + esc(v.id) + '">' + esc(v.label) + "</option>";
    }).join("");
    return (
      '<article class="card" id="product-' + esc(p.id) + '">' +
      '<h3 class="card-name">' + esc(p.name) + "</h3>" +
      '<p class="card-tag">' + esc(p.tagline) + "</p>" +
      '<p class="card-copy">' + esc(p.copy) + "</p>" +
      '<div class="card-controls">' +
      '<label class="card-label" for="amount-' + esc(p.id) + '">Amount</label>' +
      '<select class="card-select" id="amount-' + esc(p.id) + '" data-select="' + esc(p.id) + '">' + options + "</select>" +
      '<div class="card-foot">' +
      '<span class="card-price" data-price>' + money(v0.price) + "</span>" +
      buyHtml(v0) +
      "</div></div></article>"
    );
  }

  document.addEventListener("change", function (e) {
    var sel = e.target.closest("[data-select]");
    if (!sel) return;
    var p = byId[sel.getAttribute("data-select")];
    var v = variantOf(p, sel.value);
    var host = sel.closest(".card");
    host.querySelector("[data-price]").textContent = money(v.price);
    host.querySelector("[data-buy]").outerHTML = buyHtml(v);
  });

  /* ---- Age gate: shown once per session, same pattern as before ---------- */
  function ageGateHtml() {
    return (
      '<div class="agegate" id="agegate" role="dialog" aria-modal="true" aria-labelledby="agegate-title">' +
      '<div class="agegate-box">' +
      '<p class="agegate-brand">' + S.brand + "</p>" +
      '<h2 id="agegate-title">Age Verification</h2>' +
      "<p>This website sells products intended strictly for laboratory research. " +
      "You must be " + S.ageGate + " years or older to enter.</p>" +
      '<div class="agegate-actions">' +
      '<button class="btn" data-age="yes">I am ' + S.ageGate + " or older</button>" +
      '<button class="btn btn-ghost" data-age="no">Exit</button>' +
      "</div>" +
      '<p class="agegate-fine">' + S.disclaimer + "</p>" +
      "</div></div>"
    );
  }

  document.addEventListener("DOMContentLoaded", function () {
    var grid = document.getElementById("product-grid");
    if (grid) grid.innerHTML = window.PRODUCTS.map(card).join("");

    var year = document.querySelector("[data-year]");
    if (year) year.textContent = new Date().getFullYear();

    if (!sessionStorage.getItem("ageVerified")) {
      var holder = document.createElement("div");
      holder.innerHTML = ageGateHtml();
      document.body.appendChild(holder.firstChild);
      document.body.classList.add("noscroll");
      document.addEventListener("click", function (e) {
        var b = e.target.closest("[data-age]");
        if (!b) return;
        if (b.getAttribute("data-age") === "yes") {
          sessionStorage.setItem("ageVerified", "1");
          var g = document.getElementById("agegate");
          if (g) g.remove();
          document.body.classList.remove("noscroll");
        } else {
          window.location.href = "https://www.google.com";
        }
      });
    }
  });
})();
