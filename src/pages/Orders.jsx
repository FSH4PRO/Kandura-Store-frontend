import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../services/orders';
import { PackageSearch, ShoppingBag } from 'lucide-react';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { useToast } from '../context/useToast';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    (async () => {
      try {
        const { items } = await getOrders();
        setOrders(items);
      } catch (err) {
        toast.error(err.message || 'Could not load orders.');
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <Spinner label="Loading orders…" full />;

  return (
    <div>
      <p className="eyebrow mb-2">Orders</p>
      <h1 className="font-serif text-4xl text-midnight-900 mb-8">Your order history.</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="No orders yet"
          message="Place your first order from one of your saved designs."
          action={<Link to="/designs?mode=browse" className="btn-gold"><ShoppingBag className="w-4 h-4" /> Browse designs</Link>}
        />
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              to={`/orders/${o.id}`}
              className="card p-4 flex items-center justify-between hover:shadow-card-hover transition-shadow"
            >
              <div>
                <p className="font-mono text-sm text-midnight-900">{o.serial_number}</p>
                <p className="text-xs text-midnight-400 mt-1">
                  {new Date(o.created_at).toLocaleDateString()} · {o.items?.length || 0} item(s)
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold text-gold-600">AED {Number(o.total).toFixed(2)}</span>
                <StatusBadge status={o.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
