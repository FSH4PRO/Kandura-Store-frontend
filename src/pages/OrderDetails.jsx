// src/pages/OrderDetails.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById, cancelOrder } from '../services/orders';
import { applyCoupon, removeCoupon } from '../services/coupons';
import { Ticket, ChevronLeft, MapPin } from 'lucide-react';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import ImageWithFallback from '../components/ImageWithFallback';
import PaymentModal from '../components/PaymentModal';
import ReviewForm from '../components/ReviewForm';
import StarRating from '../components/StarRating';
import { useToast } from '../context/useToast';

export default function OrderDetails() {
  const { id } = useParams();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const fetchOrder = useCallback(async () => {
    try {
      const data = await getOrderById(id);
      setOrder(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load order details.');
    } finally {
      setLoading(false);
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Intentional data-fetch-on-mount pattern; fetchOrder's setState calls
  // happen after the awaited API call resolves, not synchronously in the
  // effect body.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  // Business rules straight from the API doc (§12.1) — drive the UI off
  // these exact conditions rather than guessing, to avoid dead-end 403s.
  const canCancel = order?.status === 'pending';
  const canPay = order?.status === 'accepted' && order?.payment_status !== 'paid';
  const canCoupon =
    order &&
    !['canceled', 'cancelled', 'rejected'].includes(order.status) &&
    !['pending', 'paid'].includes(order.payment_status);
  const canReview = order?.status === 'completed';

  async function handleApplyCoupon(e) {
    e.preventDefault();
    if (!couponCode) return;
    setCouponLoading(true);
    try {
      const updated = await applyCoupon(id, couponCode);
      setOrder(updated);
      setCouponCode('');
      toast.success('Coupon applied.');
    } catch (err) {
      toast.error(err.message || 'Invalid coupon code.');
    } finally {
      setCouponLoading(false);
    }
  }

  async function handleRemoveCoupon() {
    setCouponLoading(true);
    try {
      const updated = await removeCoupon(id);
      setOrder(updated);
      toast.success('Coupon removed.');
    } catch (err) {
      toast.error(err.message || 'Failed to remove coupon.');
    } finally {
      setCouponLoading(false);
    }
  }

  async function handleCancelOrder() {
    if (!window.confirm('Cancel this order? This cannot be undone.')) return;
    setCancelling(true);
    try {
      const updated = await cancelOrder(id);
      setOrder(updated);
      toast.success('Order canceled.');
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order.');
    } finally {
      setCancelling(false);
    }
  }

  if (loading) return <Spinner label="Loading order…" full />;
  if (!order) return <div className="p-8 text-center text-midnight-400">Order not found.</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/orders" className="text-sm font-medium text-gold-600 hover:text-gold-700 mb-4 inline-flex items-center gap-1">
        <ChevronLeft className="w-4 h-4" /> Back to orders
      </Link>

      <div className="flex flex-wrap justify-between items-start gap-4 mb-2">
        <div>
          <p className="eyebrow mb-1">Order</p>
          <h1 className="font-serif text-3xl text-midnight-900">{order.serial_number}</h1>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <p className="text-xs text-midnight-400 mb-8">Placed {new Date(order.created_at).toLocaleString()}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="card p-6">
            <h2 className="font-serif text-lg text-midnight-900 mb-4 border-b border-midnight-100 pb-3">Order items</h2>
            <div className="divide-y divide-midnight-100">
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-lg bg-midnight-50 overflow-hidden shrink-0">
                      <ImageWithFallback
                        src={item.design?.main_image}
                        alt={item.design?.name?.en || 'Design photo'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-midnight-900">{item.design?.name?.en || 'Custom design'}</p>
                      <p className="text-sm text-midnight-400">
                        {item.size ? `Size ${item.size.code} · ` : ''}Qty {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-midnight-900">AED {Number(item.line_total ?? item.unit_price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          {order.address && (
            <div className="card p-6">
              <h2 className="font-serif text-lg text-midnight-900 mb-3 border-b border-midnight-100 pb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gold-500" /> Delivery address
              </h2>
              <p className="text-midnight-700">{order.address?.street}</p>
              {order.address?.details && <p className="text-midnight-400 text-sm mt-1">{order.address.details}</p>}
            </div>
          )}

          {canReview && (
            <div className="card p-6">
              <h2 className="font-serif text-lg text-midnight-900 mb-4 border-b border-midnight-100 pb-3">Your review</h2>
              {order.review ? (
                <div>
                  <StarRating value={order.review.rating} readOnly size="w-5 h-5" />
                  {order.review.comment && <p className="text-sm text-midnight-600 mt-3">{order.review.comment}</p>}
                </div>
              ) : (
                <ReviewForm orderId={order.id} onSubmitted={(review) => setOrder((prev) => ({ ...prev, review }))} />
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {canCoupon && (
            <div className="card p-5">
              <h3 className="font-semibold text-midnight-900 mb-3 flex items-center gap-2 text-sm">
                <Ticket className="w-4 h-4 text-gold-500" /> Coupon
              </h3>
              {order.coupon ? (
                <div className="flex justify-between items-center bg-emerald-50 text-emerald-700 p-3 rounded-lg border border-emerald-200 text-sm">
                  <span className="font-medium">{order.coupon.code}</span>
                  <button onClick={handleRemoveCoupon} disabled={couponLoading} className="text-xs hover:underline">Remove</button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="field-input !py-2 text-sm"
                  />
                  <button type="submit" disabled={couponLoading || !couponCode} className="btn-dark !py-2 !px-4 text-sm shrink-0">Apply</button>
                </form>
              )}
            </div>
          )}

          <div className="card p-6">
            <h2 className="font-serif text-lg text-midnight-900 mb-4 border-b border-midnight-100 pb-3">Summary</h2>
            <div className="space-y-2 text-sm text-midnight-600">
              <div className="flex justify-between"><span>Subtotal</span><span>AED {Number(order.subtotal).toFixed(2)}</span></div>
              {order.coupon && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount</span><span>− AED {Number(order.coupon_discount || 0).toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="flex justify-between text-lg font-bold text-midnight-900 border-t border-midnight-100 pt-3 mt-3">
              <span>Total</span><span className="text-gold-600">AED {Number(order.total).toFixed(2)}</span>
            </div>
            <p className="text-xs text-midnight-400 mt-2">
              Payment: {order.payment_method || '—'} · {order.payment_status}
            </p>

            {canPay && (
              <button className="btn-gold w-full mt-6" onClick={() => setShowPayment(true)}>Proceed to payment</button>
            )}
            {canCancel && (
              <button className="btn-danger w-full mt-3" onClick={handleCancelOrder} disabled={cancelling}>
                {cancelling ? 'Cancelling…' : 'Cancel order'}
              </button>
            )}
          </div>
        </div>
      </div>

      {showPayment && (
        <PaymentModal order={order} onClose={() => setShowPayment(false)} onPaid={fetchOrder} />
      )}
    </div>
  );
}
