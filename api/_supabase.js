/* ============================================================================
   Shared by the checkout functions: talks to Supabase over its REST API
   (no SDK, so no package.json and no build step).

   Env vars on the host:

     SUPABASE_URL               https://<project>.supabase.co
     SUPABASE_SERVICE_ROLE_KEY  Project Settings → API → service_role.
                                SECRET — bypasses row-level security. Never
                                put it in js/ or anywhere in this repo.

   The leading underscore keeps Vercel from deploying this file as its own
   endpoint.
   ========================================================================== */

function config() {
  const url = (process.env.SUPABASE_URL || "").replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set.");
  return { url, key };
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
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=representation"
    },
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

async function updateOrder(id, patch) {
  const rows = await rest("PATCH", `orders?id=eq.${encodeURIComponent(id)}`, patch);
  return rows[0] || null;
}

module.exports = { getUser, insertOrder, getOrder, updateOrder };
