// src/services/notifications.js
import { apiFetch, normalizePaginated } from './api';

/**
 * GET /api/notifications — Resource-collection pagination shape (same
 * as designs/addresses/orders — see normalizePaginated in api.js).
 * @param {'read'|'unread'|undefined} readFilter
 */
export async function getNotifications(page = 1, readFilter) {
    const params = new URLSearchParams({ page });
    if (readFilter) params.set('read', readFilter);
    const paginator = await apiFetch(`/notifications?${params.toString()}`);
    return normalizePaginated(paginator);
}

/**
 * GET /api/notifications/unread-count
 */
export async function getUnreadCount() {
    const { count } = await apiFetch('/notifications/unread-count');
    return count;
}

/**
 * POST /api/notifications/:id/read
 */
export async function markNotificationRead(id) {
    return apiFetch(`/notifications/${id}/read`, { method: 'POST' });
}

/**
 * POST /api/notifications/read-all
 */
export async function markAllNotificationsRead() {
    return apiFetch('/notifications/read-all', { method: 'POST' });
}
