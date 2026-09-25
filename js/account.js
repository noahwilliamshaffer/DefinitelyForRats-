/* ============================================================================
   ACCOUNT — customer accounts on Supabase Auth. Loaded on account.html and
   checkout.html only, after the supabase-js CDN script.

   Buying requires an account (the processor does not accept guest
   checkout), and the account records who the customer is: name, company or
   institution, organization type, and research field. Those live in the
   Supabase user's metadata and prefill the checkout form; each order also
   snapshots them server-side (api/crypto-checkout.js).

   Exposes window.ACCOUNT:
     configured        false while site-config still holds [placeholders]
     ready             Promise → the current user or null
     token()           Promise → access token for the checkout call, or null
     user()            the current user or null (after ready)
     saveProfile(data) merge fields into the user's metadata
     renderTransfer(el, data)  bank-transfer instructions into el

   On account.html it also renders sign-in / create-account / reset forms,
   the profile, and order history, depending on [data-view] sections.
   ========================================================================== */
(function () {
  var S = window.SITE;
  var cfg = S.accounts || {};
  var configured = !!(window.supabase && cfg.supabaseUrl && cfg.supabaseAnonKey &&
    cfg.supabaseUrl.charAt(0) !== "[" && cfg.supabaseAnonKey.charAt(0) !== "[");

  var client = configured ? window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey) : null;
  var current = null;
  var recovering = false;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function optionsHtml(list, selected, placeholder) {
    return '<option value="">' + esc(placeholder) + "</option>" + list.map(function (v) {
      return '<option value="' + esc(v) + '"' + (v === selected ? " selected" : "") + ">" + esc(v) + "</option>";
    }).join("");
  }

  /* Fill every <select data-options="researchFields|organizationTypes"> from
     site-config, so the lists live in exactly one place. */
  function fillSelects(root, meta) {
    var sels = (root || document).querySelectorAll("select[data-options]");
    for (var i = 0; i < sels.length; i++) {
      var key = sels[i].getAttribute("data-options");
      var list = S[key] || [];
      var cur = sels[i].value || (meta && meta[sels[i].name]) || "";
      sels[i].innerHTML = optionsHtml(list, cur,
        key === "researchFields" ? "Select research field" : "Select organization type");
    }
  }

  var ready = configured
    ? client.auth.getSession().then(function (r) {
        current = r.data && r.data.session ? r.data.session.user : null;
        return current;
      }).catch(function () { return null; })
    : Promise.resolve(null);

  if (client) {
    client.auth.onAuthStateChange(function (event, session) {
      current = session ? session.user : null;
      if (event === "PASSWORD_RECOVERY") recovering = true;
      document.dispatchEvent(new CustomEvent("account:change", { detail: { user: current, event: event } }));
    });
  }

  function token() {
    if (!client) return Promise.resolve(null);
    return client.auth.getSession().then(function (r) {
      return r.data && r.data.session ? r.data.session.access_token : null;
    });
  }

  function saveProfile(data) {
    if (!client) return Promise.reject(new Error("Accounts are not configured."));
    return client.auth.updateUser({ data: data }).then(function (r) {
      if (r.error) throw r.error;
      current = r.data.user;
      return current;
    });
  }

  function formData(form) {
    var out = {};
    var els = form.elements;
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (!el.name) continue;
      out[el.name] = el.type === "checkbox" ? el.checked : el.value.trim();
    }
    return out;
  }

  function setMsg(el, msg, isError) {
    if (!el) return;
    el.textContent = msg || "";
    el.hidden = !msg;
    el.classList.toggle("is-error", !!isError);
  }

  /* Supabase's messages are plain English and safe to show; anything else
     gets a generic line. */
  function authError(err) {
    return (err && err.message) || "Something went wrong. Please try again.";
  }

  /* ---- account.html ------------------------------------------------------- */
  var STATUS_LABEL = {
    pending: "Not started",
    awaiting_payment: "Awaiting payment",
    awaiting_transfer: "Awaiting bank transfer",
    confirming: "Payment confirming",
    paid: "Paid",
    partially_paid: "Partially paid — contact us",
    failed: "Payment failed",
    expired: "Invoice expired",
    refunded: "Refunded",
    review: "Under review",
    cancelled: "Cancelled"
  };

  function show(view) {
    var views = document.querySelectorAll("[data-view]");
    for (var i = 0; i < views.length; i++) {
      views[i].hidden = views[i].getAttribute("data-view") !== view;
    }
  }

  function renderProfile(user) {
    var m = user.user_metadata || {};
    var email = document.querySelector("[data-account-email]");
    if (email) email.textContent = user.email;
    var form = document.querySelector("[data-profile-form]");
    if (!form) return;
    ["full_name", "company_name", "phone"].forEach(function (k) {
      if (form.elements[k]) form.elements[k].value = m[k] || "";
    });
    fillSelects(form, m);
    if (form.elements.organization_type) form.elements.organization_type.value = m.organization_type || "";
    if (form.elements.research_field) form.elements.research_field.value = m.research_field || "";
  }

  function money(cents) {
    var n = cents / 100;
    return S.currencySymbol + n.toFixed(2);
  }

  /* Bank-transfer instructions, from api/bank-transfer-checkout.js:
     { orderNumber, total, instructions, holdDays }. The bank details are
     plain text from the host's env; esc() keeps them inert. */
  function renderTransfer(el, d) {
    el.innerHTML =
      '<p class="eyebrow">Order ' + esc(d.orderNumber) + " &middot; awaiting bank transfer</p>" +
      "<h2>Send your bank transfer</h2>" +
      "<p>Your order is reserved. Send the exact amount below from your bank by ACH or wire, " +
      "and put the order number in the transfer&rsquo;s reference or memo so we can match it. " +
      "We ship once the funds arrive. Unpaid orders are cancelled after " + esc(d.holdDays) + " days.</p>" +
      '<dl class="transfer-facts">' +
      '<div><dt class="eyebrow">Amount</dt><dd>' + money(Math.round(d.total * 100)) + " USD</dd></div>" +
      '<div><dt class="eyebrow">Reference</dt><dd>' + esc(d.orderNumber) + "</dd></div>" +
      "</dl>" +
      '<pre class="transfer-bank">' + esc(d.instructions) + "</pre>" +
      '<p class="summary-fine">These details stay on your <a href="account.html">Account</a> page until the order is paid. ' +
      "Any fees your bank charges are yours; the amount we receive must match the order total.</p>";
    el.hidden = false;
  }

  function renderOrders() {
    var box = document.querySelector("[data-orders]");
    if (!box || !client) return;
    client.from("orders")
      .select("order_number, created_at, status, total_cents, items, pay_currency")
      .order("created_at", { ascending: false })
      .limit(50)
      .then(function (r) {
        if (r.error) { box.innerHTML = '<p class="cart-status is-error">Orders could not be loaded.</p>'; return; }
        var rows = (r.data || []).filter(function (o) { return o.status !== "pending"; });
        if (!rows.length) { box.innerHTML = '<p class="summary-fine">No orders yet.</p>'; return; }
        box.innerHTML =
          '<div class="table-scroll"><table class="spec coa-table"><thead><tr>' +
          '<th scope="col">Order</th><th scope="col">Date</th><th scope="col">Items</th>' +
          '<th scope="col">Total</th><th scope="col">Status</th></tr></thead><tbody>' +
          rows.map(function (o) {
            var items = (o.items || []).map(function (l) {
              return esc(l.product) + " " + esc(l.label) + " &times; " + l.qty;
            }).join("<br />");
            var status = esc(STATUS_LABEL[o.status] || o.status);
            if (o.status === "awaiting_transfer" && S.payment && S.payment.bankTransferEndpoint) {
              status += '<br /><button type="button" class="linklike" data-transfer-order="' +
                esc(o.order_number) + '">Payment instructions</button>';
            }
            return "<tr><th scope=\"row\">" + esc(o.order_number) + "</th>" +
              "<td>" + esc(new Date(o.created_at).toLocaleDateString()) + "</td>" +
              "<td>" + items + "</td>" +
              "<td>" + money(o.total_cents) + (o.pay_currency ? " <span class=\"eyebrow\">" + esc(o.pay_currency) + "</span>" : "") + "</td>" +
              "<td>" + status + "</td></tr>";
          }).join("") +
          "</tbody></table></div>" +
          '<div class="transfer" data-transfer-panel hidden tabindex="-1"></div>';
      });
  }

  function showTransfer(orderNumber) {
    var panel = document.querySelector("[data-orders] [data-transfer-panel]");
    if (!panel) return;
    token().then(function (t) {
      return fetch(S.payment.bankTransferEndpoint + "?order=" + encodeURIComponent(orderNumber), {
        headers: { Authorization: "Bearer " + t }
      });
    }).then(function (r) {
      return r.ok ? r.json() : null;
    }).then(function (d) {
      if (!d) {
        panel.innerHTML = '<p class="cart-status is-error">Payment instructions could not be loaded. Please contact us.</p>';
        panel.hidden = false;
        return;
      }
      renderTransfer(panel, d);
      panel.focus();
    }).catch(function () {
      panel.innerHTML = '<p class="cart-status is-error">Payment instructions could not be loaded. Please contact us.</p>';
      panel.hidden = false;
    });
  }

  function nextUrl() {
    var n = new URLSearchParams(location.search).get("next");
    // Same-site relative pages only — never an open redirect.
    return n && /^[a-z0-9-]+\.html$/.test(n) ? n : null;
  }

  function renderAccountPage() {
    if (!document.querySelector("[data-account-page]")) return;
    if (!configured) { show("unconfigured"); return; }
    if (recovering) { show("recover"); return; }
    if (!current) { show("signed-out"); return; }
    var n = nextUrl();
    if (n) { location.replace(n); return; }
    show("signed-in");
    renderProfile(current);
    renderOrders();
  }

  function wireAccountPage() {
    if (!document.querySelector("[data-account-page]")) return;
    fillSelects(document);

    var signIn = document.querySelector("[data-signin-form]");
    if (signIn) signIn.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = formData(signIn), msg = signIn.querySelector("[data-msg]");
      setMsg(msg, "Signing in…");
      client.auth.signInWithPassword({ email: d.email, password: d.password }).then(function (r) {
        if (r.error) { setMsg(msg, authError(r.error), true); return; }
        setMsg(msg, "");
      });
    });

    var signUp = document.querySelector("[data-signup-form]");
    if (signUp) signUp.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = formData(signUp), msg = signUp.querySelector("[data-msg]");
      if (d.password.length < 8) { setMsg(msg, "Use a password of at least 8 characters.", true); return; }
      setMsg(msg, "Creating account…");
      client.auth.signUp({
        email: d.email,
        password: d.password,
        options: {
          emailRedirectTo: location.origin + location.pathname,
          data: {
            full_name: d.full_name,
            company_name: d.company_name,
            organization_type: d.organization_type,
            research_field: d.research_field,
            phone: d.phone,
            age_confirmed_at: new Date().toISOString(),
            research_use_ack_at: new Date().toISOString()
          }
        }
      }).then(function (r) {
        if (r.error) { setMsg(msg, authError(r.error), true); return; }
        signUp.reset();
        setMsg(msg, "Check your email to confirm your address, then sign in.");
      });
    });

    var forgot = document.querySelector("[data-forgot]");
    if (forgot) forgot.addEventListener("click", function () {
      var email = signIn && signIn.elements.email.value.trim();
      var msg = signIn && signIn.querySelector("[data-msg]");
      if (!email) { setMsg(msg, "Enter your email above, then choose “Forgot password”.", true); return; }
      client.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname })
        .then(function (r) {
          setMsg(msg, r.error ? authError(r.error) : "If that address has an account, a reset link is on its way.", !!r.error);
        });
    });

    var recover = document.querySelector("[data-recover-form]");
    if (recover) recover.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = formData(recover), msg = recover.querySelector("[data-msg]");
      if (d.password.length < 8) { setMsg(msg, "Use a password of at least 8 characters.", true); return; }
      client.auth.updateUser({ password: d.password }).then(function (r) {
        if (r.error) { setMsg(msg, authError(r.error), true); return; }
        recovering = false;
        renderAccountPage();
      });
    });

    var profile = document.querySelector("[data-profile-form]");
    if (profile) profile.addEventListener("submit", function (e) {
      e.preventDefault();
      var d = formData(profile), msg = profile.querySelector("[data-msg]");
      setMsg(msg, "Saving…");
      saveProfile(d).then(function () { setMsg(msg, "Saved."); })
        .catch(function (err) { setMsg(msg, authError(err), true); });
    });

    var orders = document.querySelector("[data-orders]");
    if (orders) orders.addEventListener("click", function (e) {
      var b = e.target.closest("[data-transfer-order]");
      if (b) showTransfer(b.getAttribute("data-transfer-order"));
    });

    var out = document.querySelector("[data-signout]");
    if (out) out.addEventListener("click", function () { client.auth.signOut(); });

    document.addEventListener("account:change", renderAccountPage);
  }

  document.addEventListener("DOMContentLoaded", function () {
    wireAccountPage();
    ready.then(renderAccountPage);
  });

  window.ACCOUNT = {
    configured: configured,
    ready: ready,
    token: token,
    user: function () { return current; },
    saveProfile: saveProfile,
    fillSelects: fillSelects,
    renderTransfer: renderTransfer
  };
})();
