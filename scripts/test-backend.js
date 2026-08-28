// scripts/test-backend.js
// Simple smoke test for Kandura Store customer API
// Usage:
//   API_BASE_URL=http://127.0.0.1:8000/api node scripts/test-backend.js

const BASE = process.env.API_BASE_URL || "http://127.0.0.1:8000/api";

// eslint-disable-next-line no-unused-vars
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function apiFetch(path, opts = {}) {
  const url = `${BASE}${path}`;
  const headers = opts.headers || {};
  if (!(opts.body instanceof FormData))
    headers["Content-Type"] = "application/json";
  const final = Object.assign({}, opts, { headers });
  const res = await fetch(url, final);
  const body = await safeJson(res);

  // 401 handling
  if (res.status === 401) {
    throw { status: 401, message: "Unauthenticated", body };
  }

  // 422 Laravel validation format
  if (res.status === 422 && body && body.errors) {
    throw {
      status: 422,
      message: body.message || "Validation failed",
      errors: body.errors,
      body,
    };
  }

  // If API envelope present
  if (body && typeof body.success !== "undefined") {
    if (body.success === false)
      throw { status: res.status, message: body.message, body };
    return body.data;
  }

  // Fallback
  return body;
}

async function main() {
  console.log("Kandura backend smoke test — base:", BASE);

  // 1) Register (try with a random phone)
  const phone =
    "+97150" + Math.floor(1000000 + Math.random() * 8999999).toString();
  const password = "TestPass123";
  const name = "Smoke Tester";

  let token = null;
  try {
    console.log("\n-> Registering user", phone);
    const reg = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({
        name: { en: name },
        phone,
        password,
        password_confirmation: password,
      }),
    });
    console.log("Register response:", reg);
    if (reg?.access_token) token = reg.access_token;
    if (reg === null) {
      // fetch raw response to help debugging
      try {
        const raw = await fetch(`${BASE}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: { en: name },
            phone,
            password,
            password_confirmation: password,
          }),
        });
        const text = await raw.text();
        console.log("Raw register response status:", raw.status);
        console.log("Raw register response body:", text);
      } catch (e) {
        console.error("Raw fetch failed", e);
      }
    }
  } catch (err) {
    if (err.status === 422) {
      console.log("Register validation failed:", err.errors);
    } else {
      console.log("Register failed:", err);
    }
  }

  // 2) If no token from register, try login
  if (!token) {
    try {
      console.log("\n-> Logging in");
      const lg = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ phone, password }),
      });
      console.log("Login response:", lg);
      if (lg?.access_token) token = lg.access_token;
    } catch (err) {
      console.log("Login failed (try manual credentials?):", err);
    }
  }

  if (!token) {
    console.log(
      "\nNo token available. Aborting further authenticated requests.",
    );
    return;
  }

  console.log("\nToken obtained, continuing with authenticated requests...");

  // 3) Get profile
  try {
    const profile = await apiFetch("/user/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("Profile:", profile);
  } catch (e) {
    console.error("Profile failed", e);
  }

  // 4) List designs
  try {
    const designs = await apiFetch("/designs", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(
      "Designs list (sample):",
      Array.isArray(designs?.data) ? designs.data.slice(0, 3) : designs,
    );
  } catch (e) {
    console.error("List designs failed", e);
  }

  // 5) Create an address
  try {
    console.log("\n-> Creating address");
    const addr = await apiFetch("/addresses", {
      headers: { Authorization: `Bearer ${token}` },
      method: "POST",
      body: JSON.stringify({
        city_id: 1,
        street: "Test Street",
        details: "Smoke test",
        latitude: null,
        longitude: null,
      }),
    });
    console.log("Created address:", addr);
  } catch (e) {
    console.error("Create address failed", e);
  }

  console.log("\nSmoke test complete.");
}

main().catch((err) => {
  console.error("Fatal error in smoke test", err);
  process.exit(1);
});
