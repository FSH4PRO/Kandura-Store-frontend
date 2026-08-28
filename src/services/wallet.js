// src/services/wallet.js
import { apiFetch, normalizePaginated } from './api';

/**
 * GET /api/wallet — doc §16.1
 * Note: `currency` is a dead field on the backend (always null — doc
 * §20 gap #7) — don't build UI that depends on it.
 */
export async function getWallet() {
    return apiFetch('/wallet');
}

/**
 * GET /api/wallet/transactions — doc §16.2. This is the raw-paginator
 * shape (see api.js normalizePaginated), not the Resource-collection
 * shape used by designs/addresses/orders.
 */
export async function getWalletTransactions(page = 1) {
    const paginator = await apiFetch(`/wallet/transactions?page=${page}`);
    return normalizePaginated(paginator);
}
