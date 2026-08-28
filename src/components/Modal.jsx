import { X } from 'lucide-react';

export default function Modal({ title, onClose, children, footer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-midnight-950/60 backdrop-blur-sm px-0 sm:px-4 animate-fade-in">
      <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-card-hover animate-slide-up">
        <div className="flex items-center justify-between border-b border-midnight-100 px-6 py-4">
          <h3 className="font-serif text-xl text-midnight-900">{title}</h3>
          <button onClick={onClose} className="text-midnight-400 hover:text-midnight-900" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="border-t border-midnight-100 px-6 py-4">{footer}</div>}
      </div>
    </div>
  );
}
