const STYLES = {
  pending: 'bg-gold-50 text-gold-700 border-gold-200',
  accepted: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
  canceled: 'bg-red-50 text-red-700 border-red-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
  unpaid: 'bg-gold-50 text-gold-700 border-gold-200',
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
};

export default function StatusBadge({ status }) {
  const style = STYLES[status] || 'bg-midnight-50 text-midnight-600 border-midnight-200';
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${style}`}>
      {status}
    </span>
  );
}
