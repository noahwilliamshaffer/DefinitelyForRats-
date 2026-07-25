/* ============================================================================
   THE RAT PACK — pause/resume the four looping rats based on visibility.
   Adds `.is-animating` only while a card is on screen (battery-friendly).
   No dependencies. Degrades gracefully if IntersectionObserver is absent.
   ========================================================================== */
(function () {
  function boot() {
    var cards = document.querySelectorAll(".rat-card");
    if (!cards.length) return;

    // No IntersectionObserver (very old browsers): just animate.
    if (!("IntersectionObserver" in window)) {
      cards.forEach(function (c) { c.classList.add("is-animating"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        e.target.classList.toggle("is-animating", e.isIntersecting);
      });
    }, { threshold: 0.2 });

    cards.forEach(function (c) { io.observe(c); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
