/* ============================================================================
   CART + CHECKOUT

   Cart state lives in localStorage as an array of lines:
     { variantId, productId, name, label, price, qty }

   Checkout has two modes, chosen by SITE.payment.checkoutEndpoint:

   1. Endpoint set  -> POST the cart to a serverless function that creates a
      Stripe Checkout Session and returns { url }. One payment for the whole
      cart. See api/create-checkout-session.js.

   2. Endpoint empty -> fall back to per-line hosted Stripe Payment Links
      (js/payment-links.js). No backend required, one product at a time.

   No secret keys are ever used here — this file ships to the browser.
   ========================================================================== */
(function () {
  var S = window.SITE;
  var KEY = "dfr-cart-v1";

  /* ---- Variant index ------------------------------------------------------ */
  var VARIANTS = {};
  (window.PRODUCTS || []).forEach(function (p) {
    (p.variants || []).forEach(function (v) {
      VARIANTS[v.id] = { productId: p.id, name: p.name, label: v.label, price: v.price, id: v.id };
    });
  });

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function money(n) { return S.currencySymbol + n.toFixed(2).replace(/\.00$/, ""); }

  /* ---- State -------------------------------------------------------------- */
  var lines = [];
  try { lines = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { lines = []; }
  // Drop anything whose variant no longer exists (catalog changed since save).
  lines = lines.filter(function (l) { return VARIANTS[l.variantId]; });

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch (e) {}
  }
  function count() {
    return lines.reduce(function (n, l) { return n + l.qty; }, 0);
  }
  function subtotal() {
    return lines.reduce(function (n, l) { return n + l.price * l.qty; }, 0);
  }
  function find(variantId) {
    for (var i = 0; i < lines.length; i++) if (lines[i].variantId === variantId) return lines[i];
    return null;
  }

  function add(variantId, qty) {
    var v = VARIANTS[variantId];
    if (!v) return;
    var line = find(variantId);
    if (line) line.qty += (qty || 1);
    else lines.push({ variantId: variantId, productId: v.productId, name: v.name, label: v.label, price: v.price, qty: qty || 1 });
    save(); render();
  }
  function setQty(variantId, qty) {
    var line = find(variantId);
    if (!line) return;
    line.qty = qty;
    if (line.qty < 1) lines = lines.filter(function (l) { return l.variantId !== variantId; });
    save(); render();
  }
  function remove(variantId) {
    lines = lines.filter(function (l) { return l.variantId !== variantId; });
    save(); render();
  }

  /* ---- Rendering ---------------------------------------------------------- */
  function lineHtml(l) {
    return (
      '<li class="cart-line">' +
      '<div class="cart-line-main">' +
      '<p class="cart-line-name">' + esc(l.name) + "</p>" +
      '<p class="cart-line-label">' + esc(l.label) + "</p>" +
      "</div>" +
      '<div class="cart-line-side">' +
      '<div class="qty" role="group" aria-label="Quantity for ' + esc(l.name) + " " + esc(l.label) + '">' +
      '<button class="qty-btn" data-dec="' + esc(l.variantId) + '" aria-label="Decrease quantity">&minus;</button>' +
      '<span class="qty-n">' + l.qty + "</span>" +
      '<button class="qty-btn" data-inc="' + esc(l.variantId) + '" aria-label="Increase quantity">+</button>' +
      "</div>" +
      '<span class="cart-line-price">' + money(l.price * l.qty) + "</span>" +
      '<button class="cart-remove" data-remove="' + esc(l.variantId) + '" aria-label="Remove ' + esc(l.name) + '">Remove</button>' +
      "</div></li>"
    );
  }

  function render() {
    var n = count();

    var badge = document.querySelector("[data-cart-count]");
    if (badge) {
      badge.textContent = n;
      badge.hidden = n === 0;
    }
    var btn = document.querySelector("[data-cart-open]");
    if (btn) btn.setAttribute("aria-label", n === 1 ? "Cart, 1 item" : "Cart, " + n + " items");

    var body = document.querySelector("[data-cart-body]");
    if (!body) return;

    if (!lines.length) {
      body.innerHTML =
        '<p class="cart-empty">Your rat&rsquo;s cart is empty.<br /><span>He is waiting.</span></p>';
    } else {
      body.innerHTML = '<ul class="cart-lines">' + lines.map(lineHtml).join("") + "</ul>";
    }

    var sub = subtotal();
    var foot = document.querySelector("[data-cart-foot]");
    if (foot) foot.hidden = !lines.length;

    var subEl = document.querySelector("[data-cart-subtotal]");
    if (subEl) subEl.textContent = money(sub);

    var ship = document.querySelector("[data-cart-shipping]");
    if (ship) {
      var over = S.payment && S.payment.freeShippingOver;
      if (over && sub > 0 && sub < over) {
        ship.hidden = false;
        ship.textContent = money(over - sub) + " more for free shipping.";
      } else if (over && sub >= over) {
        ship.hidden = false;
        ship.textContent = "Free shipping unlocked.";
      } else {
        ship.hidden = true;
      }
    }
  }

  /* ---- Drawer open/close -------------------------------------------------- */
  var lastFocus = null;
  function openCart() {
    var d = document.getElementById("cart");
    if (!d) return;
    lastFocus = document.activeElement;
    d.classList.add("open");
    d.setAttribute("aria-hidden", "false");
    document.body.classList.add("noscroll");
    var close = d.querySelector("[data-cart-close]");
    if (close) close.focus();
  }
  function closeCart() {
    var d = document.getElementById("cart");
    if (!d) return;
    d.classList.remove("open");
    d.setAttribute("aria-hidden", "true");
    document.body.classList.remove("noscroll");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---- Checkout ----------------------------------------------------------- */
  function setStatus(msg, isError) {
    var el = document.querySelector("[data-cart-status]");
    if (!el) return;
    el.textContent = msg || "";
    el.hidden = !msg;
    el.classList.toggle("error", !!isError);
  }

  function linkFor(variantId) {
    return (window.PAYMENT_LINKS && window.PAYMENT_LINKS[variantId]) || "";
  }

  function checkout() {
    if (!lines.length) return;
    var btn = document.querySelector("[data-checkout]");
    var endpoint = S.payment && S.payment.checkoutEndpoint;

    // Mode 1: real multi-item Stripe Checkout via serverless endpoint.
    if (endpoint) {
      if (btn) { btn.disabled = true; btn.textContent = "Starting checkout…"; }
      setStatus("");
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map(function (l) { return { variantId: l.variantId, qty: l.qty }; })
        })
      })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          if (res.ok && res.j && res.j.url) { window.location.href = res.j.url; return; }
          throw new Error((res.j && res.j.error) || "Checkout could not be started.");
        })
        .catch(function (err) {
          setStatus(err.message + " Please try again.", true);
          if (btn) { btn.disabled = false; btn.textContent = "Checkout"; }
        });
      return;
    }

    // Mode 2: hosted Payment Links, one product at a time.
    var missing = lines.filter(function (l) { return !linkFor(l.variantId); });
    if (missing.length) {
      setStatus("Checkout links are not set up yet for: " +
        missing.map(function (l) { return l.name + " " + l.label; }).join(", ") + ".", true);
      return;
    }
    if (lines.length === 1) {
      window.location.href = linkFor(lines[0].variantId);
      return;
    }
    setStatus(
      "Hosted links pay for one product at a time. Use the Pay buttons below to " +
      "check out each item, or enable multi-item checkout (see README).", false);
    var body = document.querySelector("[data-cart-body]");
    if (body && !body.querySelector(".cart-paylinks")) {
      body.insertAdjacentHTML("beforeend",
        '<ul class="cart-paylinks">' + lines.map(function (l) {
          return '<li><a class="btn btn-ghost" href="' + esc(linkFor(l.variantId)) +
            '">Pay for ' + esc(l.name) + " " + esc(l.label) + " &rarr;</a></li>";
        }).join("") + "</ul>");
    }
  }

  /* ---- Events ------------------------------------------------------------- */
  document.addEventListener("click", function (e) {
    var t = e.target;

    var addBtn = t.closest("[data-add]");
    if (addBtn) {
      var card = addBtn.closest(".card");
      var sel = card && card.querySelector("[data-select]");
      var variantId = sel ? sel.value : addBtn.getAttribute("data-add");
      add(variantId, 1);
      addBtn.classList.add("added");
      addBtn.textContent = "Added ✓";
      setTimeout(function () {
        addBtn.classList.remove("added");
        addBtn.textContent = "Add to cart";
      }, 1200);
      openCart();
      return;
    }

    if (t.closest("[data-cart-open]")) { openCart(); return; }
    if (t.closest("[data-cart-close]") || t.closest("[data-cart-overlay]")) { closeCart(); return; }
    if (t.closest("[data-checkout]")) { checkout(); return; }

    var inc = t.closest("[data-inc]");
    if (inc) { var li = find(inc.getAttribute("data-inc")); if (li) setQty(li.variantId, li.qty + 1); setStatus(""); return; }
    var dec = t.closest("[data-dec]");
    if (dec) { var ld = find(dec.getAttribute("data-dec")); if (ld) setQty(ld.variantId, ld.qty - 1); setStatus(""); return; }
    var rm = t.closest("[data-remove]");
    if (rm) { remove(rm.getAttribute("data-remove")); setStatus(""); return; }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeCart();
  });

  // Returning from Stripe: ?checkout=success empties the cart and confirms;
  // ?checkout=cancelled leaves the cart intact so nothing is lost.
  function handleReturn() {
    var q = new URLSearchParams(location.search).get("checkout");
    if (!q) return;
    if (q === "success") {
      lines = []; save(); render();
    }
    var note = document.querySelector("[data-order-note]");
    if (note) {
      note.hidden = false;
      note.classList.toggle("cancelled", q === "cancelled");
      note.textContent = q === "success"
        ? "Order received. Your rat thanks you. A receipt is on its way by email."
        : "Checkout cancelled — your cart is exactly where you left it.";
    }
    history.replaceState({}, "", location.pathname);
  }

  document.addEventListener("DOMContentLoaded", function () {
    render();
    handleReturn();
  });

  window.CART = { add: add, remove: remove, setQty: setQty, open: openCart, close: closeCart, lines: function () { return lines.slice(); } };
})();
