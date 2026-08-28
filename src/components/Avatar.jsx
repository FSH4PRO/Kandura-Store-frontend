import { useState } from 'react';
import { User } from 'lucide-react';
import { resolveAvatarUrl } from '../lib/avatarUrl';

const SIZE_CLASSES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-lg',
  xl: 'h-24 w-24 text-2xl',
};

function initialsOf(name) {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

/**
 * Robust avatar with three states the navbar/profile page previously
 * didn't handle at all:
 *   1. No image on the user record        -> initials/icon fallback
 *   2. Image URL present but fails to load -> automatically falls back
 *      (the old code just rendered <img src=...> directly, so a stale
 *      or unreachable storage URL showed a broken-image icon)
 *   3. User data not loaded yet            -> skeleton pulse
 *
 * `src` may be a relative Laravel storage path ("/storage/avatars/x.jpg")
 * or an absolute URL — both are resolved correctly.
 */
export default function Avatar({ src, name, size = 'md', loading = false, className = '' }) {
  const [errored, setErrored] = useState(false);
  // Reset the broken-image flag when `src` itself changes (e.g. after a
  // successful re-upload), so it gets a fresh chance to load. This is
  // React's documented "adjust state during render" pattern rather than
  // an effect — an effect here would cause an extra, unnecessary render
  // pass on every src change.
  const [prevSrc, setPrevSrc] = useState(src);
  if (src !== prevSrc) {
    setPrevSrc(src);
    setErrored(false);
  }

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const resolvedSrc = resolveAvatarUrl(src);

  if (loading) {
    return (
      <div
        className={`${sizeClass} ${className} rounded-full bg-midnight-100 animate-pulse`}
        aria-hidden="true"
      />
    );
  }

  if (resolvedSrc && !errored) {
    return (
      <img
        src={resolvedSrc}
        alt={name ? `${name}'s avatar` : 'User avatar'}
        className={`${sizeClass} ${className} rounded-full object-cover bg-midnight-100`}
        onError={() => setErrored(true)}
      />
    );
  }

  const initials = initialsOf(name);

  return (
    <div
      className={`${sizeClass} ${className} flex items-center justify-center rounded-full bg-gradient-to-br from-midnight-800 to-midnight-950 font-semibold text-gold-400`}
      title={name || 'User'}
    >
      {initials || <User className="w-1/2 h-1/2" />}
    </div>
  );
}
