// src/pages/Checkout.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { getDesigns } from '../services/designs';
import { getAddresses } from '../services/addresses';
import { createOrder } from '../services/orders';
import { ShoppingBag, MapPin, AlertCircle, Plus } from 'lucide-react';
import Spinner from '../components/Spinner';
import { useToast } from '../context/useToast';

export default function Checkout() {
  const navigate = useNavigate();
  const toast = useToast();
  const [searchParams] = useSearchParams();
  const preselectedDesignId = searchParams.get('design_id');

  const [designs, setDesigns] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [selectedDesignId, setSelectedDesignId] = useState(preselectedDesignId || '');
  const [selectedSizeId, setSelectedSizeId] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const [designsRes, addressesRes] = await Promise.all([
          getDesigns({ mode: 'my', per_page: 100 }),
          getAddresses(1),
        ]);
        setDesigns(designsRes.items);
        setAddresses(addressesRes.items);
      } catch (err) {
        setError(err.message || 'Failed to load checkout dependencies.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectedDesign = designs.find((d) => d.id === parseInt(selectedDesignId));

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedDesignId) {
      setError('Please choose a design.');
      return;
    }
    if (selectedDesign?.sizes?.length && !selectedSizeId) {
      setError('Please select a size.');
      return;
    }

    // Client-side guard (API doc §12.5 / §20 gap #5): the backend's own
    // validation does NOT actually verify the size/option belongs to the
    // chosen design, so we enforce it here instead of trusting a 422.
    const sizeIsValid = !selectedDesign?.sizes?.length || selectedDesign.sizes.some((s) => s.id === parseInt(selectedSizeId));
    if (!sizeIsValid) {
      setError('The selected size is not available for this design.');
      return;
    }

    setSubmitting(true);
    try {
      const order = await createOrder({
        designId: parseInt(selectedDesignId),
        sizeId: selectedSizeId ? parseInt(selectedSizeId) : null,
        quantity: parseInt(quantity, 10) || 1,
        addressId: selectedAddressId ? parseInt(selectedAddressId) : null,
      });
      toast.success('Order placed — awaiting acceptance.');
      navigate(`/orders/${order.id}`);
    } catch (err) {
      if (err.type === 'validation') {
        setError(Object.values(err.errors).flat().join(' | '));
      } else {
        setError(err.message || 'Failed to place order');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner label="Loading checkout…" full />;

  return (
    <div className="max-w-2xl mx-auto">
      <p className="eyebrow mb-2">Your order</p>
      <h1 className="font-serif text-4xl text-midnight-900 mb-8 flex items-center gap-3">
        <ShoppingBag className="w-8 h-8 text-gold-500" /> Checkout
      </h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 flex items-center gap-2 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" /> {error}
        </div>
      )}

      {designs.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-midnight-500 mb-4">You don't have any saved designs to order yet.</p>
          <Link to="/designs/create" className="btn-gold"><Plus className="w-4 h-4" /> Draft a design</Link>
        </div>
      ) : (
        <form onSubmit={handlePlaceOrder} className="space-y-6">
          <div className="card p-6">
            <h2 className="font-serif text-lg text-midnight-900 mb-4">1. Choose your design</h2>
            <select
              value={selectedDesignId}
              onChange={(e) => { setSelectedDesignId(e.target.value); setSelectedSizeId(''); }}
              className="field-input"
              required
            >
              <option value="">— Select a saved design —</option>
              {designs.map((d) => (
                <option key={d.id} value={d.id}>{d.name?.current || d.name?.en} (AED {d.price})</option>
              ))}
            </select>
          </div>

          {selectedDesign && (
            <div className="card p-6 animate-fade-in">
              <h2 className="font-serif text-lg text-midnight-900 mb-4">2. Select size</h2>
              <div className="flex flex-wrap gap-3">
                {selectedDesign.sizes?.map((size) => (
                  <button
                    type="button"
                    key={size.id}
                    onClick={() => setSelectedSizeId(size.id)}
                    className={`px-5 py-3 rounded-xl border font-medium transition-colors ${
                      String(selectedSizeId) === String(size.id) ? 'bg-midnight-900 text-ivory border-midnight-900' : 'bg-midnight-50 text-midnight-500 border-midnight-200 hover:border-midnight-400'
                    }`}
                  >
                    {size.code}
                  </button>
                ))}
                {!selectedDesign.sizes?.length && (
                  <p className="text-sm text-red-500">No sizes were configured for this design.</p>
                )}
              </div>
            </div>
          )}

          <div className="card p-6 space-y-4">
            <h2 className="font-serif text-lg text-midnight-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gold-500" /> 3. Delivery details
            </h2>
            <div>
              <label className="field-label">Shipping address</label>
              <select value={selectedAddressId} onChange={(e) => setSelectedAddressId(e.target.value)} className="field-input">
                <option value="">— No address yet — add one from your profile —</option>
                {addresses.map((a) => (
                  <option key={a.id} value={a.id}>{a.street} ({a.city?.name || 'Unknown city'})</option>
                ))}
              </select>
              <Link to="/profile" className="text-xs text-gold-600 mt-2 inline-block">+ Add a new address</Link>
            </div>
            <div>
              <label className="field-label">Quantity</label>
              <input type="number" min="1" max="10" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="field-input w-24 text-center" required />
            </div>
          </div>

          <button type="submit" disabled={submitting || !selectedDesignId} className="btn-gold w-full !py-4 text-base">
            {submitting ? 'Submitting order…' : 'Submit order'}
          </button>
          <p className="text-xs text-midnight-400 text-center">
            Final total, discounts, and payment are confirmed after the atelier accepts your order.
          </p>
        </form>
      )}
    </div>
  );
}
