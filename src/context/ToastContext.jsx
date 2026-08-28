import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle, Info, X, AlertTriangle } from 'lucide-react';
import { ToastContext } from './toastStore';
import { notify } from '../lib/notify';

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const STYLES = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-midnight-200 bg-white text-midnight-800',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [criticalError, setCriticalError] = useState(null);
  const idRef = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((message, type = 'info') => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);

  const toast = {
    success: (msg) => push(msg, 'success'),
    error: (msg) => push(msg, 'error'),
    info: (msg) => push(msg, 'info'),
  };

  // Plain JS modules (services/api.js) can't call useToast() — they go
  // through this event bus instead, so a single failed fetch anywhere in
  // the app still surfaces through the exact same UI as everything else.
  useEffect(() => {
    return notify.subscribe((message, type, critical) => {
      if (critical) {
        setCriticalError(message);
        return;
      }
      push(message, type);
    });
  }, [push]);

  // Escape closes the centered critical-error modal.
  useEffect(() => {
    if (!criticalError) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setCriticalError(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [criticalError]);

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Corner toasts — routine success/info/error messages */}
      <div className="fixed bottom-5 right-5 z-[100] flex w-[calc(100%-2.5rem)] max-w-sm flex-col gap-2">
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div
              key={t.id}
              role="status"
              className={`animate-slide-up flex items-start gap-3 rounded-xl border px-4 py-3 shadow-card text-sm ${STYLES[t.type]}`}
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="flex-1">{t.message}</span>
              <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="opacity-60 hover:opacity-100">
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Centered modal — critical failures (network down, server error,
          session expired) that block the current action and deserve full
          attention rather than a corner toast the user might miss. */}
      {criticalError && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-midnight-950/50 backdrop-blur-sm px-4 animate-fade-in"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="critical-error-title"
          onClick={() => setCriticalError(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-card-hover animate-slide-up text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 id="critical-error-title" className="font-serif text-xl text-midnight-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-midnight-500 mb-6">{criticalError}</p>
            <button className="btn-dark w-full" onClick={() => setCriticalError(null)} autoFocus>
              Close
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
}
