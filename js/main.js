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

  // Fill/label color varies by category so the grid reads with more variety.
  var VIAL_TINT = {
    peptides:    { liquid: "#bfe9ee", label: "#0a6ebd" },
    aminos:      { liquid: "#c9ead0", label: "#0a7d4b" },
    accessories: { liquid: "#e6ecf2", label: "#5b6b7b" }
  };

  function vialSvg(category, id) {
    var t = VIAL_TINT[category] || VIAL_TINT.peptides;
    var gid = "v" + (id || Math.random().toString(36).slice(2, 7));
    return (
      '<svg viewBox="0 0 120 140" class="vial" aria-hidden="true">' +
      "<defs>" +
      '<linearGradient id="glass' + gid + '" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="#ffffff" stop-opacity=".9"/>' +
      '<stop offset=".5" stop-color="#eef4f9"/>' +
      '<stop offset="1" stop-color="#d3e0ea"/></linearGradient>' +
      '<linearGradient id="liq' + gid + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="' + t.liquid + '"/>' +
      '<stop offset="1" stop-color="' + t.liquid + '" stop-opacity=".75"/></linearGradient>' +
      "</defs>" +
      // crimp cap
      '<rect x="44" y="10" width="32" height="14" rx="3" fill="#b9c6d3"/>' +
      '<rect x="44" y="10" width="32" height="5" rx="2" fill="#cdd8e2"/>' +
      '<rect x="49" y="22" width="22" height="8" fill="#9fb0c0"/>' +
      // vial body
      '<path d="M40 30 h40 v78 a14 14 0 0 1 -14 14 h-12 a14 14 0 0 1 -14 -14 Z" fill="url(#glass' + gid + ')" stroke="#c2d2e0" stroke-width="1.5"/>' +
      // liquid
      '<path d="M42 66 h36 v42 a13 13 0 0 1 -13 13 h-10 a13 13 0 0 1 -13 -13 Z" fill="url(#liq' + gid + ')"/>' +
      // label
      '<rect x="44" y="74" width="32" height="30" rx="2" fill="#ffffff" opacity=".92"/>' +
      '<rect x="48" y="80" width="24" height="3" rx="1.5" fill="' + t.label + '"/>' +
      '<rect x="48" y="87" width="18" height="2.4" rx="1.2" fill="#9aa8b5"/>' +
      '<rect x="48" y="92" width="21" height="2.4" rx="1.2" fill="#9aa8b5"/>' +
      '<rect x="48" y="97" width="14" height="2.4" rx="1.2" fill="#c2ccd6"/>' +
      // highlight
      '<rect x="46" y="34" width="5" height="70" rx="2.5" fill="#ffffff" opacity=".55"/>' +
      "</svg>"
    );
  }

  function escAttr(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/"/g, "&quot;")
      .replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Builds the buy control for a card based on the active payment provider.
  function actionButton(p) {
    var pay = (S.payment && S.payment.provider) || "none";
    if (!p.inStock) return '<button class="btn btn-ghost btn-sm" disabled>Notify Me</button>';

    if (pay === "stripe") {
      // Each product links to its own Stripe-hosted Payment Link (product.buyUrl).
      return p.buyUrl
        ? '<a class="btn btn-primary btn-sm" href="' + escAttr(p.buyUrl) + '" target="_blank" rel="noopener">Buy Now</a>'
        : '<button class="btn btn-ghost btn-sm" disabled title="Add a Stripe Payment Link (buyUrl) for this item in js/products.js">Set Link</button>';
    }

    if (pay === "snipcart") {
      // Snipcart reads these data-attributes to build a real hosted cart/checkout.
      var price = (p.sale != null ? p.sale : p.price);
      var pageUrl = location.pathname.split("/").pop() || "index.html";
      return '<button class="btn btn-primary btn-sm snipcart-add-item"' +
        ' data-item-id="' + escAttr(p.id) + '"' +
        ' data-item-name="' + escAttr(p.name) + '"' +
        ' data-item-price="' + price + '"' +
        ' data-item-url="' + escAttr(pageUrl) + '"' +
        ' data-item-description="' + escAttr(p.blurb || "") + '">Add to Cart</button>';
    }

    // Default: demo cart (no real payment).
    return '<button class="btn btn-primary btn-sm add-cart" data-id="' + escAttr(p.id) + '">Add to Cart</button>';
  }

  function card(p) {
    var onSale = p.sale != null;
    var badge = "";
    if (!p.inStock) badge = '<span class="badge badge-out">Out of Stock</span>';
    else if (onSale) badge = '<span class="badge badge-sale">Sale</span>';

    var priceHtml = onSale
      ? '<span class="price"><s>' + money(p.price) + "</s> <strong>" + money(p.sale) + "</strong></span>"
      : '<span class="price"><strong>' + money(p.price) + "</strong></span>";

    var action = actionButton(p);

    return (
      '<article class="product-card">' +
      '<div class="product-media">' + badge +
      '<span class="test-badge" title="Third-party tested">&#10003; Tested</span>' +
      vialSvg(p.category, p.id) + "</div>" +
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

  // Contact / Wholesale forms.
  // If SITE.formEndpoint is set, POST via fetch to that email service; otherwise
  // stay in demo mode (no network call). See js/site-config.js for setup.
  function setNote(note, msg, isError) {
    if (!note) return;
    note.textContent = msg;
    note.classList.toggle("error", !!isError);
    note.classList.add("show");
  }

  document.addEventListener("submit", function (e) {
    var form = e.target.closest("[data-demo-form]");
    if (!form) return;
    e.preventDefault();
    var note = form.querySelector(".form-note");
    var endpoint = S.formEndpoint;

    if (!endpoint) {
      setNote(note, "Thanks — connect an email service in js/site-config.js (formEndpoint) to receive real messages.", false);
      form.reset();
      return;
    }

    var btn = form.querySelector('button[type="submit"]');
    var label = btn ? btn.textContent : "";
    if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }

    var data = new FormData(form);
    if (S.formAccessKey) data.append("access_key", S.formAccessKey); // Web3Forms
    data.append("_subject", S.brand + " — website enquiry");

    fetch(endpoint, { method: "POST", headers: { Accept: "application/json" }, body: data })
      .then(function (r) {
        if (r.ok) {
          setNote(note, "Thanks! Your message has been sent — we'll be in touch shortly.", false);
          form.reset();
        } else {
          setNote(note, "Sorry, something went wrong. Please email us directly at " + S.email + ".", true);
        }
      })
      .catch(function () {
        setNote(note, "Network error — please email us directly at " + S.email + ".", true);
      })
      .finally(function () {
        if (btn) { btn.disabled = false; btn.textContent = label; }
      });
  });

  // Boots the selected payment provider. Runs after the header is injected so
  // the cart button exists.
  var SNIPCART_VERSION = "3.7.3";
  function initPayments() {
    var cfg = S.payment || {};
    var pay = cfg.provider || "none";

    if (pay === "stripe") {
      // Per-product hosted checkout — no site cart needed, so hide the cart icon.
      var cb = document.querySelector(".cart-btn");
      if (cb) cb.style.display = "none";
      return;
    }

    if (pay === "snipcart") {
      if (!cfg.snipcartKey) {
        console.warn("[payments] provider is 'snipcart' but SITE.payment.snipcartKey is empty.");
        return;
      }
      var base = "https://cdn.snipcart.com/themes/v" + SNIPCART_VERSION + "/default/";

      var css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = base + "snipcart.css";
      document.head.appendChild(css);

      var settings = document.createElement("div");
      settings.id = "snipcart";
      settings.setAttribute("hidden", "");
      settings.setAttribute("data-api-key", cfg.snipcartKey);
      if (cfg.currency) settings.setAttribute("data-currency", cfg.currency);
      document.body.appendChild(settings);

      var sc = document.createElement("script");
      sc.async = true;
      sc.src = base + "snipcart.js";
      document.body.appendChild(sc);

      // Turn the header cart into the Snipcart cart trigger + live item count.
      var cart = document.querySelector(".cart-btn");
      if (cart) {
        cart.classList.add("snipcart-checkout");
        var count = cart.querySelector(".cart-count");
        if (count) count.classList.add("snipcart-items-count");
      }
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    initPayments();
  });
})();
