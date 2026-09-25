/* ============================================================================
   Shared by the checkout functions: talks to Supabase over its REST API
   (no SDK, so no package.json and no build step).

   Env vars on the host:

     SUPABASE_URL          https://<project>.supabase.co
     SUPABASE_SECRET_KEY   Project Settings → API Keys → Secret keys
                           (sb_secret_…). SECRET — bypasses row-level
                           security. Never put it in js/ or in this repo.

   The legacy SUPABASE_SERVICE_ROLE_KEY (a JWT) still works as a fallback,
   but prefer a secret key: it can be revoked on its own without rotating the
   project's JWT secret.

   The leading underscore keeps Vercel from deploying this file as its own
   endpoint.
   ========================================================================== */

function config() {
  const url = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SECRET_KEY not set.");
  // A publishable or anon key can check logins but cannot write orders, so
  // it fails later with a bare 401. Name the mistake here instead.
  if (key.startsWith("sb_publishable_") || jwtRole(key) === "anon") {
    throw new Error("SUPABASE_SECRET_KEY holds a publishable/anon key. Use the sb_secret_ key.");
  }
  return { url, key };
}

/* The role claim of a legacy JWT key, or null for anything else. */
function jwtRole(key) {
  if (!key.startsWith("eyJ")) return null;
  try {
    return JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString("utf8")).role || null;
  } catch (e) {
    return null;
  }
}

function configured() {
  return !!(process.env.SUPABASE_URL &&
    (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY));
}

/* Headers for a server-privileged call. A new sb_secret_ key is not a JWT:
   it goes in `apikey` alone and Supabase's gateway runs the request as
   service_role. The legacy service-role JWT is also sent as the Bearer. */
function serverHeaders(key) {
  const h = { apikey: key };
  if (!key.startsWith("sb_")) h.Authorization = `Bearer ${key}`;
  return h;
}

/* The signed-in user behind a browser access token, or null. Supabase checks
   the token's signature and expiry; we never decode it ourselves. */
async function getUser(accessToken) {
  if (!accessToken) return null;
  const { url, key } = config();
  const r = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: key, Authorization: `Bearer ${accessToken}` }
  });
  if (!r.ok) return null;
  const user = await r.json();
  return user && user.id ? user : null;
}

/* PostgREST call with the service-role key. Returns parsed rows. */
async function rest(method, pathAndQuery, body) {
  const { url, key } = config();
  const r = await fetch(`${url}/rest/v1/${pathAndQuery}`, {
    method,
    headers: Object.assign(serverHeaders(key), {
      "Content-Type": "application/json",
      Prefer: "return=representation"
    }),
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Supabase ${method} ${pathAndQuery}: ${r.status} ${text}`);
  return text ? JSON.parse(text) : [];
}

async function insertOrder(row) {
  const rows = await rest("POST", "orders", row);
  return rows[0];
}

async function getOrder(id) {
  const rows = await rest("GET", `orders?id=eq.${encodeURIComponent(id)}&select=*`);
  return rows[0] || null;
}

/* One of this user's orders by its human-readable number, or null. */
async function getUserOrder(orderNumber, userId) {
  const rows = await rest("GET",
    `orders?order_number=eq.${encodeURIComponent(orderNumber)}` +
    `&user_id=eq.${encodeURIComponent(userId)}&select=*`);
  return rows[0] || null;
}

async function updateOrder(id, patch) {
  const rows = await rest("PATCH", `orders?id=eq.${encodeURIComponent(id)}`, patch);
  return rows[0] || null;
}

module.exports = { configured, getUser, insertOrder, getOrder, getUserOrder, updateOrder };
