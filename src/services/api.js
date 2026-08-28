// src/services/api.js
import { notify } from "../lib/notify";

const BASE_URL =
  import.meta.env.VITE_API_URL || "https://kandura-store.onrender.com/api";

const REQUEST_TIMEOUT_MS = 20000;

// Local storage token/user helpers
export const getToken = () => localStorage.getItem("kandura_access_token");
export const setToken = (token) =>
  localStorage.setItem("kandura_access_token", token);
export const removeToken = () =>
  localStorage.removeItem("kandura_access_token");

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("kandura_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
export const setStoredUser = (user) =>
  localStorage.setItem("kandura_user", JSON.stringify(user));
export const removeStoredUser = () => localStorage.removeItem("kandura_user");

export function flattenValidationErrors(errors = {}) {
  return Object.entries(errors).reduce((acc, [field, messages]) => {
    acc[field] = Array.isArray(messages) ? messages : [String(messages)];
    return acc;
  }, {});
}

// ---------------------------------------------------------------------
// Pagination normalizer — the backend uses TWO different pagination
// shapes. Resource-collection endpoints (designs, addresses, orders)
// return { data: [...], links, meta }. The wallet transactions endpoint
// returns Laravel's raw paginator ({ current_page, data: [...],
// last_page, total, ... }) with no wrapping envelope around it. This
// helper normalizes both into one shape so every list-rendering page in
// the app uses the same contract.
// ---------------------------------------------------------------------
export function normalizePaginated(payload) {
  if (!payload) return { items: [], page: 1, lastPage: 1, total: 0 };

  if (payload.meta) {
    return {
      items: Array.isArray(payload.data) ? payload.data : [],
      page: payload.meta.current_page ?? 1,
      lastPage: payload.meta.last_page ?? 1,
      total: payload.meta.total ?? payload.data?.length ?? 0,
    };
  }

  if (typeof payload.current_page !== "undefined") {
    return {
      items: Array.isArray(payload.data) ? payload.data : [],
      page: payload.current_page ?? 1,
      lastPage: payload.last_page ?? 1,
      total: payload.total ?? payload.data?.length ?? 0,
    };
  }

  if (Array.isArray(payload)) {
    return { items: payload, page: 1, lastPage: 1, total: payload.length };
  }

  return { items: [], page: 1, lastPage: 1, total: 0 };
}

function redirectToLogin() {
  if (import.meta.env.MODE === "test") return;
  if (typeof window !== "undefined" && window.location) {
    try {
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    } catch {
      // jsdom/navigation stubs may throw during tests
    }
  }
}

// Friendly, non-technical copy for the notification system — callers
// never see "AxiosError" / raw fetch messages, only these.
const FRIENDLY_MESSAGES = {
  network: "Unable to connect to the server. Please check your internet connection.",
  timeout: "The server is taking too long to respond. Please try again.",
  401: "Your session has expired. Please sign in again.",
  403: "You don't have permission to do that.",
  404: "We couldn't find what you were looking for.",
  429: "Too many requests — please wait a moment and try again.",
  500: "Something went wrong on our end. Please try again in a moment.",
  502: "The server is temporarily unavailable. Please try again shortly.",
  503: "The service is temporarily unavailable. Please try again shortly.",
};

/**
 * Universal fetch wrapper for the Kandura Store customer API.
 *
 * Every response is normalized to { code, success, message, data,
 * timestamp } on success -> resolves to `data.data`. Errors are thrown
 * as a structured object ({ type, message, status, errors? }) so
 * calling code can still do field-specific handling (422 -> form
 * errors), while generic/blocking failures (network down, session
 * expired, server errors) are ALSO pushed through the global
 * notification bus automatically — callers don't have to remember to
 * do this themselves in every component.
 */
export async function apiFetch(endpoint, options = {}) {
  const token = getToken();

  const headers = {
    Accept: "application/json",
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    // fetch() itself throws for network failures (offline, DNS, CORS
    // block) and AbortError on timeout — neither has an HTTP status, so
    // they never reach the status checks below without this catch.
    const isTimeout = err.name === "AbortError";
    const message = isTimeout ? FRIENDLY_MESSAGES.timeout : FRIENDLY_MESSAGES.network;
    notify.error(message, { critical: true });
    throw { type: isTimeout ? "timeout" : "network", message, status: 0 };
  } finally {
    clearTimeout(timeoutId);
  }

  // Global 401 handling: any 401 means "log the user out".
  if (response.status === 401) {
    removeToken();
    removeStoredUser();
    notify.error(FRIENDLY_MESSAGES[401], { critical: true });
    redirectToLogin();
    throw { type: "auth", message: FRIENDLY_MESSAGES[401], status: 401 };
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // no JSON body — leave data as null
  }

  // Laravel FormRequest validation failure (422). Intentionally NOT
  // auto-notified here — validation errors belong next to the relevant
  // form fields (handled by the calling component), not as a popup.
  if (response.status === 422 && data?.errors) {
    throw {
      type: "validation",
      message: data.message || "Please check the highlighted fields.",
      errors: flattenValidationErrors(data.errors),
      status: 422,
    };
  }

  if (response.status === 403) {
    notify.error(FRIENDLY_MESSAGES[403]);
    throw { type: "forbidden", message: data?.message || FRIENDLY_MESSAGES[403], status: 403 };
  }

  if (response.status === 404) {
    notify.error(FRIENDLY_MESSAGES[404]);
    throw { type: "not_found", message: FRIENDLY_MESSAGES[404], status: 404 };
  }

  if (response.status === 429) {
    notify.error(FRIENDLY_MESSAGES[429]);
    throw { type: "rate_limited", message: FRIENDLY_MESSAGES[429], status: 429 };
  }

  if ([500, 502, 503].includes(response.status)) {
    const message = FRIENDLY_MESSAGES[response.status];
    notify.error(message, { critical: true });
    throw { type: "server", message, status: response.status };
  }

  // Standard envelope
  if (data && typeof data.success !== "undefined") {
    if (data.success === false) {
      const message = data.message || "Something went wrong. Please try again.";
      notify.error(message);
      throw { type: "api", message, code: data.code, status: response.status, payload: data };
    }
    return data.data;
  }

  if (!response.ok) {
    const message = data?.message || "Something went wrong. Please try again.";
    notify.error(message);
    throw { type: "http", message, status: response.status, payload: data };
  }

  // Fallback: return parsed JSON as-is (endpoints that don't use the
  // envelope at all, if any are ever added on the backend).
  return data;
}
