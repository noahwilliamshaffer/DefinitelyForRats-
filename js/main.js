/* ============================================================================
   MAIN — renders product grids from PRODUCTS and wires up simple UI.
   Any element with [data-products] gets filled with matching product cards:
     data-products="peptides"   -> that category
     data-products="all"        -> everything
     data-products="bestseller" -> flagged bestsellers
     data-limit="8"             -> optional cap
   ========================================================================== */
(function () {
  var S = window.SITE;

  function money(n) {
    return S.currency + Number(n).toFixed(2).replace(/\.00$/, ".00");
  }

  function vialSvg() {
    return (
      '<svg viewBox="0 0 80 80" class="vial" aria-hidden="true">' +
      '<rect x="30" y="8" width="20" height="8" rx="2" fill="#c9d6e2"/>' +
      '<rect x="32" y="16" width="16" height="6" fill="#9fb3c7"/>' +
      '<path d="M31 22 h18 v40 a9 9 0 0 1 -9 9 a9 9 0 0 1 -9 -9 Z" fill="#eef4f9" stroke="#c2d2e0" stroke-width="1.5"/>' +
      '<path d="M31 50 h18 v12 a9 9 0 0 1 -9 9 a9 9 0 0 1 -9 -9 Z" fill="#dff0f2"/>' +
      "</svg>"
    );
  }

  function card(p) {
    var onSale = p.sale != null;
    var badge = "";
    if (!p.inStock) badge = '<span class="badge badge-out">Out of Stock</span>';
    else if (onSale) badge = '<span class="badge badge-sale">Sale</span>';

    var priceHtml = onSale
      ? '<span class="price"><s>' + money(p.price) + "</s> <strong>" + money(p.sale) + "</strong></span>"
      : '<span class="price"><strong>' + money(p.price) + "</strong></span>";

    var action = p.inStock
      ? '<button class="btn btn-primary btn-sm add-cart" data-id="' + p.id + '">Add to Cart</button>'
      : '<button class="btn btn-ghost btn-sm" disabled>Notify Me</button>';

    return (
      '<article class="product-card">' +
      '<div class="product-media">' + badge +
      '<span class="test-badge" title="Third-party tested">&#10003; Tested</span>' +
      vialSvg() + "</div>" +
      '<div class="product-body">' +
      '<h3 class="product-name">' + p.name + "</h3>" +
      '<p class="product-blurb">' + (p.blurb || "") + "</p>" +
      '<div class="product-foot">' + priceHtml + action + "</div>" +
      "</div></article>"
    );
  }

  function render() {
    document.querySelectorAll("[data-products]").forEach(function (host) {
      var mode = host.getAttribute("data-products");
      var limit = parseInt(host.getAttribute("data-limit") || "0", 10);
      var list = window.PRODUCTS.filter(function (p) {
        if (mode === "all") return true;
        if (mode === "bestseller") return p.bestseller;
        return p.category === mode;
      });
      if (limit > 0) list = list.slice(0, limit);
      host.innerHTML = list.map(card).join("");
      var countEl = document.querySelector("[data-count]");
      if (countEl && mode !== "bestseller") countEl.textContent = list.length + " products";
    });
  }

  // Simple in-memory cart counter (demo only — no real checkout).
  var cart = 0;
  document.addEventListener("click", function (e) {
    var b = e.target.closest(".add-cart");
    if (!b) return;
    cart += 1;
    var c = document.querySelector(".cart-count");
    if (c) {
      c.textContent = cart;
      c.classList.remove("pop");
      void c.offsetWidth;
      c.classList.add("pop");
    }
    b.textContent = "Added ✓";
    setTimeout(function () { b.textContent = "Add to Cart"; }, 1200);
  });

  // Contact form (demo — prevents real submission).
  document.addEventListener("submit", function (e) {
    var form = e.target.closest("[data-demo-form]");
    if (!form) return;
    e.preventDefault();
    var note = form.querySelector(".form-note");
    if (note) {
      note.textContent = "Thanks — this is a demo form. Wire it to your backend or email service to receive messages.";
      note.classList.add("show");
    }
    form.reset();
  });

  document.addEventListener("DOMContentLoaded", render);
})();
