import { useState } from 'react';
import { Banknote, CreditCard, Wallet as WalletIcon } from 'lucide-react';
import Modal from './Modal';
import { payOrder } from '../services/orders';
import { useToast } from '../context/useToast';

const METHODS = [
  { id: 'cod', label: 'Cash on delivery', description: 'Pay when your order arrives.', icon: Banknote },
  { id: 'wallet', label: 'Wallet balance', description: 'Pay instantly from your Kandura wallet.', icon: WalletIcon },
  { id: 'stripe', label: 'Card (Stripe)', description: "You'll be redirected to a secure checkout.", icon: CreditCard },
];

export default function PaymentModal({ order, onClose, onPaid }) {
  const [method, setMethod] = useState('cod');
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  async function confirm() {
    setSubmitting(true);
    try {
      const result = await payOrder(order.id, method);
      if (result.redirect_url) {
        // Stripe — hand off to Stripe Checkout. The customer lands back on
        // this order's page afterwards (success_url/cancel_url, doc §13).
        window.location.href = result.redirect_url;
        return;
      }
      toast.success('Payment confirmed.');
      onPaid?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Payment failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      title="Complete payment"
      onClose={onClose}
      footer={
        <button className="btn-gold w-full" disabled={submitting} onClick={confirm}>
          {submitting ? 'Processing…' : `Pay AED ${Number(order.total).toFixed(2)}`}
        </button>
      }
    >
      <div className="space-y-3">
        {METHODS.map((m) => {
          const Icon = m.icon;
          const active = method === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethod(m.id)}
              className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition ${
                active ? 'border-gold-400 bg-gold-50/60 ring-1 ring-gold-200' : 'border-midnight-200 hover:border-midnight-300'
              }`}
            >
              <Icon className={`w-5 h-5 mt-0.5 ${active ? 'text-gold-600' : 'text-midnight-400'}`} />
              <span>
                <span className="block text-sm font-semibold text-midnight-900">{m.label}</span>
                <span className="block text-xs text-midnight-400">{m.description}</span>
              </span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
