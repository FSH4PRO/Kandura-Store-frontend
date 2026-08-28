import { Loader2 } from 'lucide-react';

export default function Spinner({ label = 'Loading…', full = false }) {
  return (
    <div className={`flex items-center justify-center gap-3 text-midnight-400 ${full ? 'py-24' : 'py-10'}`}>
      <Loader2 className="w-5 h-5 animate-spin text-gold-500" />
      <span className="text-sm">{label}</span>
    </div>
  );
}
