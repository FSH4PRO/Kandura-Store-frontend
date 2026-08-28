// src/services/reviews.js
import { apiFetch } from './api';

/**
 * POST /api/orders/:id/review — doc §15.1
 */
export async function createReview(orderId, { rating, comment }) {
    return apiFetch(`/orders/${orderId}/review`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment: comment || undefined }),
    });
}

/**
 * PUT /api/reviews/:id — doc §15.2
 */
export async function updateReview(reviewId, { rating, comment }) {
    return apiFetch(`/reviews/${reviewId}`, {
        method: 'PUT',
        body: JSON.stringify({ rating, comment: comment || undefined }),
    });
}

/**
 * DELETE /api/reviews/:id — doc §15.3
 */
export async function deleteReview(reviewId) {
    return apiFetch(`/reviews/${reviewId}`, { method: 'DELETE' });
}
