// src/services/coupons.js
import { apiFetch } from './api';

/**
 * POST /api/orders/:id/coupon — doc §14.1. Returns the updated Order
 * resource directly.
 */
export async function applyCoupon(orderId, code) {
    return apiFetch(`/orders/${orderId}/coupon`, {
        method: 'POST',
        body: JSON.stringify({ code }),
    });
}

/**
 * POST /api/orders/:id/coupon/remove — doc §14.2.
 * (Not DELETE /orders/:id/coupon — that route doesn't exist on this API.)
 */
export async function removeCoupon(orderId) {
    return apiFetch(`/orders/${orderId}/coupon/remove`, {
        method: 'POST',
    });
}
