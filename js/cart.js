/* ============================================================================
   CART — state, Add to cart buttons, and the checkout page.

   Cart state lives in localStorage as an array of lines:
     { variantId, productId, name, label, price, qty }

   Loaded on every page: it keeps the topbar count in sync and wires the
   [data-add] buttons. On checkout.html it also renders the lines, the
   subtotal, and the Pay control.

   Checkout has two modes, chosen by SITE.payment.checkoutEndpoint:

     1. Endpoint set   — POST the cart to a serverless function that creates a
        Stripe Checkout Session and returns { url }: one payment for the whole
        cart. See api/create-checkout-session.js. Needs a host that runs
        functions (Vercel/Netlify) — GitHub Pages cannot.

     2. Endpoint empty — fall back to the per-variant hosted Payment Links in
        js/payment-links.js. No backend, but one product at a time.

   No secret key is ever used here — this file ships to the browser.
   ========================================================================== */
(function () {
  var S = window.SITE;
  var KEY = "dfr-cart-v1";

  /* ---- Variant index ------------------------------------------------------ */
  var VARIANTS = {};
  (window.PRODUCTS || []).forEach(function (p) {
    (p.variants || []).forEach(function (v) {
      VARIANTS[v.id] = {
        id: v.id, productId: p.id, name: p.name, label: v.label, price: v.price
      };
    });
  });

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function money(n) {
    return S.currencySymbol + (n % 1 === 0 ? n : n.toFixed(2));
  }

  /* ---- State -------------------------------------------------------------- */
  var lines = [];
  try { lines = JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { lines = []; }
  // Drop anything whose variant no longer exists (catalogue changed since save)
  // and re-read the price from the catalogue rather than trusting what was
  // stored — a stale price must never reach checkout.
  lines = lines.filter(function (l) { return VARIANTS[l.variantId]; })
    .map(function (l) {
      var v = VARIANTS[l.variantId];
      return {
        variantId: v.id, productId: v.productId, name: v.name, label: v.label,
        price: v.price, qty: Math.min(Math.max(parseInt(l.qty, 10) || 1, 1), 99)
      };
    });

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch (e) { /* full or private */ }
  }
  function count() {
    return lines.reduce(function (n, l) { return n + l.qty; }, 0);
  }
  function subtotal() {
    return lines.reduce(function (n, l) { return n + l.price * l.qty; }, 0);
  }
  function find(variantId) {
    for (var i = 0; i < lines.length; i++) {
      if (lines[i].variantId === variantId) return lines[i];
    }
    return null;
  }

  function add(variantId, qty) {
    var v = VARIANTS[variantId];
    if (!v) return;
    var line = find(variantId);
    if (line) line.qty = Math.min(line.qty + (qty || 1), 99);
    else lines.push({
      variantId: v.id, productId: v.productId, name: v.name,
      label: v.label, price: v.price, qty: qty || 1
    });
    save(); render();
  }
  function setQty(variantId, qty) {
    var line = find(variantId);
    if (!line) return;
    line.qty = Math.min(qty, 99);
    if (line.qty < 1) lines = lines.filter(function (l) { return l.variantId !== variantId; });
    save(); render();
  }
  function remove(variantId) {
    lines = lines.filter(function (l) { return l.variantId !== variantId; });
    save(); render();
  }

  /* ---- Rendering ---------------------------------------------------------- */
  function lineHtml(l) {
    var name = esc(l.name) + " &mdash; " + esc(l.label);
    return (
      '<li class="cline">' +
      '<div class="cline-id">' +
      '<p class="cline-name">' + esc(l.name) + "</p>" +
      '<p class="eyebrow">' + esc(l.label) + "</p>" +
      "</div>" +
      '<div class="qty" role="group" aria-label="Quantity, ' + name + '">' +
      '<button type="button" class="qty-btn" data-dec="' + esc(l.variantId) +
      '" aria-label="Decrease quantity, ' + name + '">&minus;</button>' +
      '<span class="qty-n" aria-live="polite">' + l.qty + "</span>" +
      '<button type="button" class="qty-btn" data-inc="' + esc(l.variantId) +
      '" aria-label="Increase quantity, ' + name + '">+</button>' +
      "</div>" +
      '<p class="cline-price">' + money(l.price * l.qty) + "</p>" +
      '<button type="button" class="cline-remove" data-remove="' + esc(l.variantId) +
      '" aria-label="Remove ' + name + '">Remove</button>' +
      "</li>"
    );
  }

  function render() {
    var n = count();

    // Topbar count, on every page.
    var badge = document.querySelector("[data-cart-count]");
    if (badge) {
      badge.textContent = n;
      badge.hidden = n === 0;
    }
    var link = document.querySelector("[data-cart-link]");
    if (link) {
      link.setAttribute("aria-label", n === 1 ? "Cart, 1 item" : "Cart, " + n + " items");
    }

    // Checkout page only.
    var list = document.querySelector("[data-cart-lines]");
    if (!list) return;

    list.innerHTML = lines.map(lineHtml).join("");

    var empty = document.querySelector("[data-cart-empty]");
    if (empty) empty.hidden = lines.length > 0;
    var summary = document.querySelector("[data-cart-summary]");
    if (summary) summary.hidden = lines.length === 0;

    var sub = document.querySelector("[data-cart-subtotal]");
    if (sub) sub.textContent = money(subtotal());
    var cnt = document.querySelector("[data-cart-itemcount]");
    if (cnt) cnt.textContent = n === 1 ? "1 item" : n + " items";

    var pay = document.querySelector("[data-checkout]");
    if (pay) pay.disabled = lines.length === 0;

    var links = document.querySelector("[data-paylinks]");
    if (links) { links.innerHTML = ""; links.hidden = true; }
  }

  /* ---- Checkout ----------------------------------------------------------- */
  function setStatus(msg, isError) {
    var el = document.querySelector("[data-cart-status]");
    if (!el) return;
    el.textContent = msg || "";
    el.hidden = !msg;
    el.classList.toggle("is-error", !!isError);
  }

  function linkFor(variantId) {
    return (window.PAYMENT_LINKS && window.PAYMENT_LINKS[variantId]) || "";
  }

  /* Mode 2 — hosted Payment Links, one product at a time. This is also the
     safety net whenever the endpoint is absent or unhappy: a buyer must never
     be dead-ended at the last step, and must never be shown a raw parse error
     from a host that answered with an HTML 404 instead of JSON. */
  function payWithLinks(note) {
    // A variant without a link is never presented as payable.
    var missing = lines.filter(function (l) { return !linkFor(l.variantId); });
    if (missing.length) {
      setStatus("Checkout is not set up yet for: " + missing.map(function (l) {
        return l.name + " " + l.label;
      }).join(", ") + ".", true);
      return;
    }

    // Straight through only when the link will charge exactly what the cart
    // shows: one line, quantity one.
    if (lines.length === 1 && lines[0].qty === 1) {
      window.location.href = linkFor(lines[0].variantId);
      return;
    }

    var box = document.querySelector("[data-paylinks]");
    if (!box) return;
    // Each hosted link opens its own checkout at quantity 1. Deliberately no
    // line total on these buttons: the cart quantity does not carry across, so
    // showing one would promise a charge the link will not make. Quantity is
    // adjustable on Stripe's page.
    setStatus((note ? note + " " : "") +
      "Hosted links pay for one product at a time. Each button below opens " +
      "that item's checkout at quantity 1 — set the quantity you want there.", false);
    box.hidden = false;
    box.innerHTML = lines.map(function (l) {
      return '<li><a class="btn btn-ghost btn-block" href="' + esc(linkFor(l.variantId)) +
        '">Pay for ' + esc(l.name) + " " + esc(l.label) + " &rarr;</a></li>";
    }).join("");
  }

  function checkout() {
    if (!lines.length) return;
    var btn = document.querySelector("[data-checkout]");
    var endpoint = S.payment && S.payment.checkoutEndpoint;

    // No endpoint configured — hosted links are the only route.
    if (!endpoint) { payWithLinks(); return; }

    function restore() {
      if (btn) { btn.disabled = false; btn.textContent = "Checkout"; }
    }

    if (btn) { btn.disabled = true; btn.textContent = "Starting checkout…"; }
    setStatus("");

    // Mode 1 — one payment for the whole cart, via the serverless endpoint.
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: lines.map(function (l) { return { variantId: l.variantId, qty: l.qty }; })
      })
    })
      .then(function (r) {
        // Read as text first: a host without this route answers with an HTML
        // error page, and r.json() would throw something meaningless at the
        // buyer instead of letting us fall back.
        return r.text().then(function (body) {
          var parsed = null;
          try { parsed = JSON.parse(body); } catch (e) { /* not JSON */ }
          return { ok: r.ok, json: parsed };
        });
      })
      .then(function (res) {
        if (res.ok && res.json && res.json.url) {
          window.location.href = res.json.url;
          return;
        }
        restore();
        payWithLinks("Checkout for the whole cart is unavailable right now.");
      })
      .catch(function () {
        restore();
        payWithLinks("Checkout for the whole cart is unavailable right now.");
      });
  }

  /* ---- Events ------------------------------------------------------------- */
  // The variant to add comes from the selected pill in the nearest pill group;
  // if there is none, the button carries the id itself.
  function selectedVariant(btn) {
    var scope = btn.closest(".card") || btn.closest(".buybox") || document;
    var pill = scope.querySelector('.pill[aria-checked="true"]');
    return pill ? pill.getAttribute("data-variant") : btn.getAttribute("data-add");
  }

  document.addEventListener("click", function (e) {
    var t = e.target;

    var addBtn = t.closest("[data-add]");
    if (addBtn && !addBtn.disabled) {
      var variantId = selectedVariant(addBtn);
      if (!variantId) return;
      add(variantId, 1);
      var was = addBtn.textContent;
      addBtn.textContent = "Added";
      addBtn.classList.add("is-added");
      setTimeout(function () {
        addBtn.textContent = was;
        addBtn.classList.remove("is-added");
      }, 1200);
      return;
    }

    // Buy now is Add to cart plus a trip to the cart page — one checkout for
    // the whole order, never a separate payment per item.
    var buyNow = t.closest("[data-buy-now]");
    if (buyNow && !buyNow.disabled) {
      var buyId = selectedVariant(buyNow) || buyNow.getAttribute("data-buy-now");
      if (!buyId) return;
      add(buyId, 1);
      window.location.href = "checkout.html";
      return;
    }

    if (t.closest("[data-checkout]")) { checkout(); return; }

    var inc = t.closest("[data-inc]");
    if (inc) {
      var li = find(inc.getAttribute("data-inc"));
      if (li) setQty(li.variantId, li.qty + 1);
      setStatus("");
      return;
    }
    var dec = t.closest("[data-dec]");
    if (dec) {
      var ld = find(dec.getAttribute("data-dec"));
      if (ld) setQty(ld.variantId, ld.qty - 1);
      setStatus("");
      return;
    }
    var rm = t.closest("[data-remove]");
    if (rm) { remove(rm.getAttribute("data-remove")); setStatus(""); return; }
  });

  // Returning from Stripe: ?checkout=success empties the cart and confirms;
  // ?checkout=cancelled leaves the cart exactly as it was.
  function handleReturn() {
    var q = new URLSearchParams(location.search).get("checkout");
    if (!q) return;
    if (q === "success") { lines = []; save(); render(); }
    var note = document.querySelector("[data-order-note]");
    if (note) {
      note.hidden = false;
      note.classList.toggle("is-cancelled", q === "cancelled");
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

  window.CART = {
    add: add, remove: remove, setQty: setQty,
    lines: function () { return lines.slice(); },
    count: count, subtotal: subtotal
  };
})();
