import { useEffect, useState } from 'react';
import { getWallet, getWalletTransactions } from '../services/wallet';
import { Wallet as WalletIcon, ArrowDownCircle, ArrowUpCircle, Receipt } from 'lucide-react';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { useToast } from '../context/useToast';

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [meta, setMeta] = useState({ page: 1, lastPage: 1 });
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const toast = useToast();

  async function loadPage(page = 1) {
    setPageLoading(true);
    try {
      const { items, page: current, lastPage } = await getWalletTransactions(page);
      setTransactions(items);
      setMeta({ page: current, lastPage });
    } catch (err) {
      toast.error(err.message || 'Could not load transactions.');
    } finally {
      setPageLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      try {
        const [balance] = await Promise.all([getWallet(), loadPage(1)]);
        setWallet(balance);
      } catch (err) {
        toast.error(err.message || 'Could not load your wallet.');
      } finally {
        setLoading(false);
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <Spinner label="Loading wallet…" full />;

  return (
    <div className="max-w-3xl mx-auto">
      <p className="eyebrow mb-2">Wallet</p>
      <h1 className="font-serif text-4xl text-midnight-900 mb-8">Your balance & history.</h1>

      <div className="rounded-2xl bg-midnight-950 text-ivory p-8 mb-8 shadow-card-hover relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-gold-400/10" />
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gold-400/20 flex items-center justify-center">
            <WalletIcon className="w-5 h-5 text-gold-400" />
          </div>
          <span className="text-sm uppercase tracking-wide text-midnight-300">Available balance</span>
        </div>
        <p className="font-serif text-5xl">AED {Number(wallet?.balance ?? 0).toFixed(2)}</p>
        <p className="text-xs text-midnight-400 mt-3">
          Top-ups are handled by the atelier team — there is no self-service top-up yet.
        </p>
      </div>

      <div className="card p-6">
        <h2 className="font-serif text-lg text-midnight-900 mb-4 border-b border-midnight-100 pb-3 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-gold-500" /> Transaction history
        </h2>

        {pageLoading ? (
          <Spinner label="Loading transactions…" />
        ) : transactions.length === 0 ? (
          <EmptyState title="No transactions yet" message="Payments and top-ups will show up here." />
        ) : (
          <>
            <div className="divide-y divide-midnight-100">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    {t.type === 'credit' ? (
                      <ArrowDownCircle className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <ArrowUpCircle className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-midnight-900">{t.description || (t.type === 'credit' ? 'Wallet top-up' : 'Order payment')}</p>
                      <p className="text-xs text-midnight-400">{new Date(t.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className={`font-semibold ${t.type === 'credit' ? 'text-emerald-600' : 'text-midnight-900'}`}>
                    {t.type === 'credit' ? '+' : '−'} AED {Number(t.amount).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {meta.lastPage > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6 text-sm">
                <button className="btn-ghost" disabled={meta.page <= 1} onClick={() => loadPage(meta.page - 1)}>← Prev</button>
                <span className="text-midnight-400">Page {meta.page} of {meta.lastPage}</span>
                <button className="btn-ghost" disabled={meta.page >= meta.lastPage} onClick={() => loadPage(meta.page + 1)}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
