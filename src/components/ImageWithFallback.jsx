import { useState } from 'react';
import { ImageOff } from 'lucide-react';

/**
 * Same problem as the navbar avatar bug, but for product/order images:
 * a raw <img src=...> shows the browser's broken-image icon the moment
 * a design's photo URL 404s or the media host is briefly unreachable.
 * This swaps to a clean placeholder instead, and only renders the <img>
 * once it's actually loaded (skeleton shown until then) to avoid the
 * layout "pop-in" of a late-loading image.
 */
export default function ImageWithFallback({ src, alt = '', className = '' }) {
  const [status, setStatus] = useState(src ? 'loading' : 'empty');
  const [prevSrc, setPrevSrc] = useState(src);
  if (src !== prevSrc) {
    setPrevSrc(src);
    setStatus(src ? 'loading' : 'empty');
  }

  if (status === 'empty' || status === 'error') {
    return (
      <div className={`${className} flex items-center justify-center bg-midnight-50 text-midnight-300`}>
        <ImageOff className="w-1/4 h-1/4 min-w-4 min-h-4" aria-hidden="true" />
      </div>
    );
  }

  return (
    <>
      {status === 'loading' && (
        <div className={`${className} bg-midnight-50 animate-pulse`} aria-hidden="true" />
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${status === 'loading' ? 'hidden' : ''}`}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
    </>
  );
}
