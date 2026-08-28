// src/services/auth.js
import { apiFetch, setToken, removeToken, setStoredUser, removeStoredUser } from "./api";

function persistSession(response) {
  if (!response?.access_token) return;
  setToken(response.access_token);
  // eslint-disable-next-line no-unused-vars
  const { access_token, token_type, ...user } = response;
  setStoredUser(user);
}

/**
 * POST /api/auth/register — doc §6.1
 * @param {Object} payload - { name: { en, ar }, phone, password, password_confirmation }
 */
export async function registerCustomer(payload) {
  const response = await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  persistSession(response);
  return response;
}

/**
 * POST /api/auth/login — doc §6.2 (throttled 5/minute/IP)
 */
export async function loginCustomer(phone, password) {
  const response = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ phone, password }),
  });
  persistSession(response);
  return response;
}

/**
 * POST /api/auth/logout — doc §6.3. Revokes ALL of the customer's tokens
 * server-side, not just this device's.
 */
export async function logoutCustomer() {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } finally {
    removeToken();
    removeStoredUser();
  }
}
