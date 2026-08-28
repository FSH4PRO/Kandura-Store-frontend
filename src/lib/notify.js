// src/lib/notify.js
//
// Tiny pub/sub bus so plain JS modules (like services/api.js, which is
// not a React component and can't call useToast()) can trigger the same
// global notification UI that components use directly. ToastContext
// subscribes to this on mount; everything else just calls notify.error()
// / notify.success() and doesn't need to know or care who's listening.
//
// This is what lets the API client show one consistent, friendly popup
// for network/auth/server errors without every single component that
// calls the API having to duplicate that error-handling logic.

const listeners = new Set();

// De-dupe: identical messages fired within this window are collapsed
// into one toast, so e.g. three parallel failed requests on a page load
// (each hitting the same expired-token 401) don't stack three identical
// "Your session has expired" popups.
const DEDUPE_WINDOW_MS = 2500;
let lastMessage = null;
let lastTimestamp = 0;

function emit(message, type, critical) {
  const now = Date.now();
  if (message === lastMessage && now - lastTimestamp < DEDUPE_WINDOW_MS) {
    return;
  }
  lastMessage = message;
  lastTimestamp = now;
  listeners.forEach((fn) => fn(message, type, critical));
}

export const notify = {
  success: (message) => emit(message, 'success', false),
  error: (message, { critical = false } = {}) => emit(message, 'error', critical),
  info: (message) => emit(message, 'info', false),
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
