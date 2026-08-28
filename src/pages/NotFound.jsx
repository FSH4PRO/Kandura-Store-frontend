import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-sm w-full text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gold-50 text-gold-500">
          <Compass className="w-7 h-7" />
        </div>
        <p className="eyebrow mb-2">404</p>
        <h1 className="font-serif text-3xl text-midnight-900 mb-2">Page not found</h1>
        <p className="text-sm text-midnight-500 mb-6">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Link to="/" className="btn-gold">Back to the atelier</Link>
      </div>
    </div>
  );
}
