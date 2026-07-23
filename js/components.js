/* ============================================================================
   COMPONENTS — renders the shared announcement bar, header, footer, and the
   age-gate modal from SITE config. Included on every page so there is one
   source of truth for chrome and navigation.
   ========================================================================== */
(function () {
  var S = window.SITE;
  var page = (location.pathname.split("/").pop() || "index.html");
  if (page === "") page = "index.html";

  function iconLogo() {
    // Inline SVG mark so there are no external image requests / copied assets.
    return (
      '<svg viewBox="0 0 40 40" width="34" height="34" aria-hidden="true" class="logo-mark">' +
      '<defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#12c2c9"/><stop offset="1" stop-color="#0a6ebd"/>' +
      '</linearGradient></defs>' +
      '<path d="M20 3 L34 11 V29 L20 37 L6 29 V11 Z" fill="none" stroke="url(#lg)" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M14 25 L20 12 L26 25" fill="none" stroke="url(#lg)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<line x1="16.5" y1="20" x2="23.5" y2="20" stroke="url(#lg)" stroke-width="2.5" stroke-linecap="round"/>' +
      "</svg>"
    );
  }

  function navHtml() {
    return S.nav
      .map(function (n) {
        var active = n.href === page ? " class=\"active\"" : "";
        return '<li><a href="' + n.href + '"' + active + ">" + n.label + "</a></li>";
      })
      .join("");
  }

  /* ---- Announcement bar --------------------------------------------------- */
  function announcementHtml() {
    return (
      '<div class="announce">' +
      '<div class="wrap announce-inner">' +
      "<span>&#9673; Free USA Shipping on Orders " + S.currency + S.freeShipThreshold + "+</span>" +
      "<span>&#9673; Same-Day Shipping on orders before " + S.sameDayCutoff + "</span>" +
      "<span>&#9673; Purity " + S.purity + " &mdash; Third-Party Tested</span>" +
      "</div></div>"
    );
  }

  /* ---- Header ------------------------------------------------------------- */
  function headerHtml() {
    return (
      announcementHtml() +
      '<div class="header-main">' +
      '<div class="wrap header-inner">' +
      '<a class="brand" href="index.html">' +
      iconLogo() +
      '<span class="brand-text"><strong>' + S.brand + "</strong><em>" + S.tagline + "</em></span>" +
      "</a>" +
      '<button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">' +
      '<span></span><span></span><span></span></button>' +
      '<nav class="main-nav"><ul>' + navHtml() + "</ul></nav>" +
      '<div class="header-actions">' +
      '<button class="icon-btn" aria-label="Search" title="Search">&#128269;</button>' +
      '<button class="icon-btn" aria-label="Account" title="Account">&#128100;</button>' +
      '<button class="icon-btn cart-btn" aria-label="Cart" title="Cart">&#128722;<span class="cart-count">0</span></button>' +
      "</div>" +
      "</div></div>"
    );
  }

  /* ---- Footer ------------------------------------------------------------- */
  function footerHtml() {
    var cols = S.footer.columns
      .map(function (c) {
        var links = c.links
          .map(function (l) {
            return '<li><a href="' + l.href + '">' + l.label + "</a></li>";
          })
          .join("");
        return '<div class="foot-col"><h4>' + c.title + "</h4><ul>" + links + "</ul></div>";
      })
      .join("");

    return (
      '<div class="footer-top"><div class="wrap footer-grid">' +
      '<div class="foot-col foot-brand">' +
      '<div class="brand small">' + iconLogo() +
      '<span class="brand-text"><strong>' + S.brand + "</strong><em>" + S.tagline + "</em></span></div>" +
      "<p>" + S.legalName + "</p>" +
      '<p class="foot-email"><a href="mailto:' + S.email + '">' + S.email + "</a></p>" +
      '<p class="foot-hours">' + S.supportHours + "</p>" +
      "</div>" +
      cols +
      "</div></div>" +
      '<div class="footer-disclaimer"><div class="wrap">' +
      "<p><strong>Research Use Only.</strong> " + S.disclaimer + "</p>" +
      "</div></div>" +
      '<div class="footer-bottom"><div class="wrap footer-bottom-inner">' +
      "<span>&copy; " + new Date().getFullYear() + " " + S.brand + ". All rights reserved.</span>" +
      '<span class="age-badge">' + S.ageGate + "+ &mdash; Age Restricted</span>" +
      "</div></div>"
    );
  }

  /* ---- Age gate modal ----------------------------------------------------- */
  function ageGateHtml() {
    return (
      '<div class="agegate" id="agegate" role="dialog" aria-modal="true" aria-labelledby="agegate-title">' +
      '<div class="agegate-box">' +
      '<div class="brand center">' + iconLogo() +
      '<span class="brand-text"><strong>' + S.brand + "</strong></span></div>" +
      '<h2 id="agegate-title">Age Verification</h2>' +
      "<p>This website sells products intended strictly for laboratory research. " +
      "You must be " + S.ageGate + " years or older to enter.</p>" +
      '<div class="agegate-actions">' +
      '<button class="btn btn-primary" data-age="yes">I am ' + S.ageGate + " or older</button>" +
      '<button class="btn btn-ghost" data-age="no">Exit</button>' +
      "</div>" +
      '<p class="agegate-fine">' + S.disclaimer + "</p>" +
      "</div></div>"
    );
  }

  function inject(id, html) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.title = document.title || S.brand;
    inject("site-header", headerHtml());
    inject("site-footer", footerHtml());

    // Age gate: insert once, remember choice for the session.
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

    // Mobile nav toggle
    document.addEventListener("click", function (e) {
      var t = e.target.closest(".nav-toggle");
      if (!t) return;
      var nav = document.querySelector(".main-nav");
      var open = nav.classList.toggle("open");
      t.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });
})();
