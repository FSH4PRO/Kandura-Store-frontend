import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, BellOff } from 'lucide-react';
import { useNotifications } from '../context/useNotifications';
import { useToast } from '../context/useToast';

function timeAgo(dateString) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateString).toLocaleDateString();
}

// Where a notification's "action" (see NotificationResource on the
// backend) should link to inside this app.
function actionHref(notification) {
  const action = notification.action;
  if (!action) return null;
  if (action.type === 'order_details' && action.order_id) return `/orders/${action.order_id}`;
  return null;
}

export default function NotificationBell() {
  const { unreadCount, notifications, loading, refreshList, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    if (open) refreshList();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click / Escape — standard dropdown behavior.
  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  async function handleMarkAllRead() {
    try {
      await markAllRead();
    } catch (err) {
      toast.error(err.message || 'Could not mark notifications as read.');
    }
  }

  async function handleItemClick(notification) {
    if (!notification.is_read) {
      try {
        await markRead(notification.id);
      } catch {
        // non-fatal — the notification stays visible either way
      }
    }
    setOpen(false);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-full text-midnight-500 hover:bg-midnight-50 hover:text-midnight-900 transition-colors"
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        aria-expanded={open}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-burgundy px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-2xl border border-midnight-100 bg-white shadow-card-hover animate-slide-up z-50 overflow-hidden"
          role="menu"
        >
          <div className="flex items-center justify-between border-b border-midnight-100 px-4 py-3">
            <p className="font-serif text-lg text-midnight-900">Notifications</p>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-xs font-medium text-gold-600 hover:text-gold-700"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="py-10 text-center text-sm text-midnight-400">Loading…</div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center py-10 px-4 text-center">
                <BellOff className="w-6 h-6 text-midnight-300 mb-2" />
                <p className="text-sm text-midnight-400">No notifications yet.</p>
              </div>
            ) : (
              <ul>
                {notifications.map((n) => {
                  const href = actionHref(n);
                  const Wrapper = href ? Link : 'div';
                  const wrapperProps = href ? { to: href } : {};
                  return (
                    <li key={n.id} className="border-b border-midnight-50 last:border-0">
                      <Wrapper
                        {...wrapperProps}
                        onClick={() => handleItemClick(n)}
                        className={`block w-full text-left px-4 py-3 transition-colors hover:bg-midnight-50 cursor-pointer ${
                          !n.is_read ? 'bg-gold-50/40' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {!n.is_read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold-500" aria-hidden="true" />}
                          <div className={n.is_read ? 'pl-4' : ''}>
                            <p className="text-sm font-medium text-midnight-900">{n.title}</p>
                            <p className="text-xs text-midnight-500 mt-0.5">{n.body}</p>
                            <p className="text-[11px] text-midnight-300 mt-1">{timeAgo(n.created_at)}</p>
                          </div>
                        </div>
                      </Wrapper>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
