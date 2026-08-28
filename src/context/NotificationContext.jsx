import { useCallback, useEffect, useRef, useState } from 'react';
import { NotificationContext } from './notificationStore';
import { useAuth } from './useAuth';
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '../services/notifications';

const POLL_INTERVAL_MS = 45000;

// Centralizes notification state (unread count + list) so the bell badge
// and dropdown panel share one source of truth, and so the unread count
// can be polled in the background without every consumer needing to know
// about that. There's no push/websocket channel wired on the frontend
// yet (see NOTIFICATION_SYSTEM.md) — polling is the honest interim
// approach rather than pretending this is real-time.
export function NotificationProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const pollRef = useRef(null);

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch {
      // Silent on purpose: a failed background poll shouldn't interrupt
      // the user with a popup — api.js already handles genuinely severe
      // failures (network down, session expired) with its own modal.
    }
  }, [isAuthenticated]);

  const refreshList = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { items } = await getNotifications(1);
      setNotifications(items);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const markRead = useCallback(async (id) => {
    const updated = await markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const markAllRead = useCallback(async () => {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
    setUnreadCount(0);
  }, []);

  // Reset notification state the moment auth flips to logged-out, using
  // React's documented "adjust state during render" pattern (same as
  // Avatar.jsx's prevSrc) rather than calling setState synchronously
  // inside an effect body.
  const [prevAuthed, setPrevAuthed] = useState(isAuthenticated);
  if (isAuthenticated !== prevAuthed) {
    setPrevAuthed(isAuthenticated);
    if (!isAuthenticated) {
      setUnreadCount(0);
      setNotifications([]);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return undefined;

    // Intentional data-fetch-on-mount + poll subscription; refreshUnreadCount's
    // setState call happens after its awaited fetch resolves, not
    // synchronously in this effect body (same false-positive pattern
    // addressed in OrderDetails.jsx).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshUnreadCount();
    pollRef.current = setInterval(refreshUnreadCount, POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [isAuthenticated, refreshUnreadCount]);

  const value = {
    unreadCount,
    notifications,
    loading,
    refreshList,
    markRead,
    markAllRead,
  };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}
