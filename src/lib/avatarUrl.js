// src/lib/avatarUrl.js
//
// Split out of Avatar.jsx so that file can export only the component
// (react-refresh/only-export-components requires component files to
// export components only).

/**
 * The Laravel API sometimes returns absolute media-library URLs already
 * (avatar_url, main_image_url) but is documented to occasionally hand
 * back a bare storage-relative path too — resolve either case against
 * the API's origin rather than assuming one or the other. Local file
 * previews (blob:) and inline data URLs are passed through untouched.
 */
export function resolveAvatarUrl(src) {
  if (!src) return null;
  if (/^(https?|blob|data):/i.test(src)) return src;

  const apiBase = import.meta.env.VITE_API_URL || 'https://kandura-store.onrender.com/api';
  let origin;
  try {
    origin = new URL(apiBase).origin;
  } catch {
    return src;
  }
  return `${origin}${src.startsWith('/') ? '' : '/'}${src}`;
}
