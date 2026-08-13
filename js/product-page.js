/* ============================================================================
   PRODUCT PAGE — renders the one product page from window.PRODUCTS.

   The page tells us which product it is via <body data-product="…">; every
   piece of content below comes from js/products.js, so adding or changing a
   product never means editing HTML.

   Builds, in the reference site's order:
     gallery (main image + thumbnail strip) · buy box (eyebrow, title, price,
     copy, option pills, Buy now, notice callout, trust rows) · numbered 01-04
     accordions · Description / Additional information tabs.

   Loads after js/main.js and uses window.RATS for the shared helpers.
   ========================================================================== */
(function () {
  var R = window.RATS;
  var S = window.SITE;
  if (!R) return;

  var p = R.byId[document.body.getAttribute("data-product")];
  if (!p) return;

  var esc = R.esc;

  var CHECK =
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.75" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M2.5 8.5 6 12l7.5-8"/></svg>';

  /* ---- Gallery ------------------------------------------------------------ */
  function renderGallery(root) {
    var imgs = p.images || [];
    if (!imgs.length) return;

    var thumbs = "";
    if (imgs.length > 1) {
      root.classList.add("has-thumbs");
      for (var i = 0; i < imgs.length; i++) {
        thumbs += '<button type="button" class="thumb" aria-current="' + (i === 0 ? "true" : "false") +
          '" data-index="' + i + '">' +
          '<img src="' + esc(imgs[i].src) + '" alt="" />' +
          '<span class="visually-hidden">View image ' + (i + 1) + ' of ' + imgs.length + "</span>" +
          "</button>";
      }
      thumbs = '<div class="thumbs">' + thumbs + "</div>";
    }

    root.innerHTML =
      '<div class="gallery-main">' +
      '<img id="gallery-image" src="' + esc(imgs[0].src) + '" alt="' + esc(imgs[0].alt) + '" />' +
      "</div>" + thumbs;

    root.addEventListener("click", function (e) {
      var t = e.target.closest(".thumb");
      if (!t) return;
      var img = imgs[Number(t.getAttribute("data-index"))];
      var main = root.querySelector("#gallery-image");
      main.src = img.src;
      main.alt = img.alt;
      var all = root.querySelectorAll(".thumb");
      for (var i = 0; i < all.length; i++) {
        all[i].setAttribute("aria-current", all[i] === t ? "true" : "false");
      }
    });
  }

  /* ---- Buy box ------------------------------------------------------------ */
  function renderBuyBox(root) {
    var trust = "";
    for (var i = 0; i < (p.trust || []).length; i++) {
      trust += "<li>" + CHECK + "<span>" + esc(p.trust[i]) + "</span></li>";
    }

    root.innerHTML =
      '<div class="buybox-head">' +
      '<p class="eyebrow">' + esc(p.tagline) + "</p>" +
      "<h1>" + esc(p.name) + "</h1>" +
      "</div>" +

      '<p class="price" data-price>' + R.priceRange(p) + "</p>" +

      '<p class="lede">' + esc(p.copy) + "</p>" +

      '<div class="options">' +
      '<p class="eyebrow" id="choose-label">Choose an option</p>' +
      '<div class="pills" role="radiogroup" aria-labelledby="choose-label" data-pills>' +
      R.pillsHtml(p, null) +
      "</div></div>" +

      '<div class="buy-slot">' +
      '<div class="buy-actions">' +
      '<button type="button" class="btn btn-ghost" data-add disabled>Add to cart</button>' +
      '<button type="button" class="btn btn-accent" data-buy-now disabled>Buy now</button>' +
      "</div>" +
      '<p class="eyebrow" data-buyhint>Choose an option to continue</p>' +
      "</div>" +

      '<div class="notice">' +
      '<p class="eyebrow">Important product notice</p>' +
      "<p data-disclaimer>" + esc(S.disclaimer) + "</p>" +
      "</div>" +

      '<ul class="trust">' + trust + "</ul>";

    var slot = root.querySelector(".buy-actions");
    var hint = root.querySelector("[data-buyhint]");

    R.initPills(root.querySelector("[data-pills]"), function (variantId) {
      var v = R.variantOf(p, variantId);
      if (!v) return;
      R.setPrice(root.querySelector("[data-price]"), R.money(v.price));
      // Both controls just get enabled and re-pointed at the selected variant.
      // Buy now adds to the cart and goes to checkout (see js/cart.js), so the
      // whole order is paid for in one go rather than per item.
      ["[data-add]", "[data-buy-now]"].forEach(function (sel) {
        var btn = slot.querySelector(sel);
        btn.disabled = false;
        btn.setAttribute(sel.slice(1, -1), v.id);
      });
      if (hint) hint.hidden = true;
    });
  }

  /* ---- Numbered accordions ------------------------------------------------ */
  function renderNotes(root) {
    var out = "";
    for (var i = 0; i < (p.notes || []).length; i++) {
      var n = p.notes[i];
      var body = "";
      for (var b = 0; b < n.body.length; b++) body += "<p>" + esc(n.body[b]) + "</p>";
      out +=
        '<details class="note-item">' +
        "<summary>" +
        '<span class="note-num">' + esc(n.n) + "</span>" +
        '<span class="note-title">' + esc(n.title) + "</span>" +
        '<span class="note-sign" aria-hidden="true"></span>' +
        "</summary>" +
        '<div class="note-body">' + body + "</div>" +
        "</details>";
    }
    root.innerHTML = out;
  }

  /* ---- Tab panel content -------------------------------------------------- */
  function renderTabContent() {
    var desc = document.getElementById("panel-description");
    if (desc) {
      desc.innerHTML =
        '<div class="prose"><p>' + esc(p.copy) + "</p>" +
        (p.detail ? "<p>" + esc(p.detail) + "</p>" : "") + "</div>";
    }

    var spec = document.getElementById("panel-additional");
    if (spec) {
      var rows = "";
      for (var i = 0; i < (p.spec || []).length; i++) {
        rows += "<tr><th scope=\"row\">" + esc(p.spec[i][0]) + "</th><td>" +
          esc(p.spec[i][1]) + "</td></tr>";
      }
      spec.innerHTML = '<table class="spec"><tbody>' + rows + "</tbody></table>";
    }
  }

  /* ---- Tabs --------------------------------------------------------------- */
  function initTabs(list) {
    if (!list) return;
    var tabs = Array.prototype.slice.call(list.querySelectorAll(".tab"));

    function show(tab) {
      for (var i = 0; i < tabs.length; i++) {
        var on = tabs[i] === tab;
        tabs[i].setAttribute("aria-selected", on ? "true" : "false");
        tabs[i].tabIndex = on ? 0 : -1;
        document.getElementById(tabs[i].getAttribute("aria-controls")).hidden = !on;
      }
    }

    list.addEventListener("click", function (e) {
      var tab = e.target.closest(".tab");
      if (tab) show(tab);
    });

    list.addEventListener("keydown", function (e) {
      var keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
      if (keys.indexOf(e.key) === -1) return;
      var at = tabs.indexOf(document.activeElement);
      if (at === -1) return;
      var to;
      if (e.key === "Home") to = 0;
      else if (e.key === "End") to = tabs.length - 1;
      else if (e.key === "ArrowRight") to = (at + 1) % tabs.length;
      else to = (at - 1 + tabs.length) % tabs.length;
      e.preventDefault();
      tabs[to].focus();
      show(tabs[to]);
    });
  }

  /* ---- Boot --------------------------------------------------------------- */
  document.addEventListener("DOMContentLoaded", function () {
    document.title = p.name + " — " + S.brand;

    var crumb = document.querySelector("[data-crumb]");
    if (crumb) crumb.textContent = p.name;

    renderGallery(document.getElementById("pdp-gallery"));
    renderBuyBox(document.getElementById("pdp-buybox"));
    renderNotes(document.getElementById("pdp-notes"));
    renderTabContent();
    initTabs(document.getElementById("pdp-tablist"));
  });
})();
