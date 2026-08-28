import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getDesigns } from '../services/designs';
import { Plus, Shirt, ShoppingBag } from 'lucide-react';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ImageWithFallback from '../components/ImageWithFallback';
import { useToast } from '../context/useToast';

export default function Designs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get('mode') === 'browse' ? 'browse' : 'my';
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { items } = await getDesigns({ mode, per_page: 24, sort_by: 'created_at', sort_dir: 'desc' });
        if (!cancelled) setDesigns(items);
      } catch (err) {
        if (!cancelled) toast.error(err.message || 'Could not load designs.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="eyebrow mb-2">Designs</p>
          <h1 className="font-serif text-4xl text-midnight-900">{mode === 'my' ? 'My designs' : 'The gallery'}</h1>
          <p className="text-sm text-midnight-400 mt-1">
            {mode === 'my' ? 'Every pattern you have drafted, ready to reorder.' : 'Designs published by other members of the atelier.'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className={`btn-outline !py-2 !px-4 text-sm ${mode === 'browse' ? '!bg-midnight-900 !text-ivory !border-midnight-900' : ''}`}
            onClick={() => setSearchParams({ mode: 'browse' })}
          >
            Gallery
          </button>
          <button
            className={`btn-outline !py-2 !px-4 text-sm ${mode === 'my' ? '!bg-midnight-900 !text-ivory !border-midnight-900' : ''}`}
            onClick={() => setSearchParams({ mode: 'my' })}
          >
            My designs
          </button>
          <Link to="/designs/create" className="btn-gold !py-2 !px-4 text-sm">
            <Plus className="w-4 h-4" /> New design
          </Link>
        </div>
      </div>

      {loading ? (
        <Spinner label="Loading designs…" full />
      ) : designs.length === 0 ? (
        <EmptyState
          icon={Shirt}
          title={mode === 'my' ? 'No designs yet' : 'Nothing here yet'}
          message={mode === 'my' ? 'Draft your first custom kandura to see it here.' : 'Check back soon, or be the first to publish a design.'}
          action={<Link to="/designs/create" className="btn-gold">Start a design</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((d) => (
            <article key={d.id} className="card overflow-hidden group hover:shadow-card-hover transition-shadow">
              <div className="aspect-[4/5] bg-midnight-50 overflow-hidden">
                <ImageWithFallback
                  src={d.main_image_url}
                  alt={d.name?.current || d.name?.en || 'Design photo'}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <h3 className="font-serif text-xl text-midnight-900 truncate">{d.name?.current || d.name?.en || 'Unnamed design'}</h3>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-semibold text-gold-600">AED {Number(d.price).toFixed(2)}</span>
                  {d.sizes?.length > 0 && (
                    <span className="text-xs text-midnight-400">{d.sizes.map((s) => s.code).join(' · ')}</span>
                  )}
                </div>
                <Link
                  to={`/checkout?design_id=${d.id}`}
                  className="btn-dark w-full mt-4 !py-2.5 text-sm"
                >
                  <ShoppingBag className="w-4 h-4" /> Order this design
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
