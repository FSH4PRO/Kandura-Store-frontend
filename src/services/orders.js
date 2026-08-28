// src/services/orders.js
import { apiFetch, normalizePaginated } from './api';

/**
 * GET /api/orders — doc §12.4. No filter/search/sort params exist on this
 * endpoint (unlike Designs/Addresses — doc §20 gap #12).
 */
export async function getOrders() {
    const paginator = await apiFetch('/orders');
    return normalizePaginated(paginator);
}

/**
 * GET /api/orders/:id — doc §12.6. Returns the Order resource directly.
 */
export async function getOrderById(id) {
    return apiFetch(`/orders/${id}`);
}

/**
 * POST /api/orders — doc §12.5.
 * IMPORTANT: the API expects `{ items: [{ design_id, size_id, quantity,
 * options }], address_id }`, NOT a flat { design_id, size_id, ... }
 * object — sending the flat shape fails validation. This function builds
 * the correct payload from simple arguments so callers can't get it wrong.
 *
 * @param {Object} args
 * @param {number} args.designId
 * @param {number|null} args.sizeId
 * @param {number} args.quantity
 * @param {Array<{optionId:number, value:any}>} [args.options]
 * @param {number|null} [args.addressId]
 */
export async function createOrder({ designId, sizeId, quantity, options = [], addressId = null }) {
    const payload = {
        items: [
            {
                design_id: designId,
                size_id: sizeId ?? null,
                quantity,
                options: options.map((o) => ({ option_id: o.optionId, value: o.value })),
            },
        ],
        address_id: addressId,
    };

    return apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
}

/**
 * POST /api/orders/:id/cancel — doc §12.7. Only allowed while status is
 * 'pending' — the caller is responsible for hiding the action otherwise.
 */
export async function cancelOrder(id) {
    return apiFetch(`/orders/${id}/cancel`, { method: 'POST' });
}

/**
 * POST /api/orders/:id/pay — doc §13. Only allowed while order.status is
 * 'accepted' and payment_status isn't already 'paid'.
 * @param {number} id
 * @param {'cod'|'stripe'|'wallet'} paymentMethod
 */
export async function payOrder(id, paymentMethod) {
    return apiFetch(`/orders/${id}/pay`, {
        method: 'POST',
        body: JSON.stringify({
            payment_method: paymentMethod,
            success_url: `${window.location.origin}/orders/${id}`,
            cancel_url: `${window.location.origin}/orders/${id}`,
        }),
    });
}
