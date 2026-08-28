// src/services/addresses.js
import { apiFetch, normalizePaginated } from "./api";

// TEMPORARY WORKAROUND — API doc §9 / §20 gap #3: GET /api/cities does
// not exist. These names/order match CitySeeder on a freshly seeded
// database; confirm real ids with the backend, or ask them to add
// GET /api/cities and delete this fallback.
export const FALLBACK_CITIES = [
  { id: 1, name: "Dubai" },
  { id: 2, name: "Abu Dhabi" },
  { id: 3, name: "Sharjah" },
  { id: 4, name: "Ajman" },
  { id: 5, name: "Ras Al Khaimah" },
  { id: 6, name: "Riyadh" },
  { id: 7, name: "Jeddah" },
  { id: 8, name: "Dammam" },
  { id: 9, name: "Doha" },
  { id: 10, name: "Kuwait City" },
  { id: 11, name: "Manama" },
  { id: 12, name: "Muscat" },
];

/**
 * GET /api/addresses — doc §8.1
 */
export async function getAddresses(page = 1) {
  const paginator = await apiFetch(`/addresses?page=${page}`);
  return normalizePaginated(paginator);
}

/**
 * POST /api/addresses — doc §8.2. Returns the Address resource directly.
 */
export async function createAddress(addressData) {
  return apiFetch("/addresses", {
    method: "POST",
    body: JSON.stringify(addressData),
  });
}

/**
 * PUT /api/addresses/:id — doc §8.3
 */
export async function updateAddress(addressId, addressData) {
  return apiFetch(`/addresses/${addressId}`, {
    method: "PUT",
    body: JSON.stringify(addressData),
  });
}

/**
 * DELETE /api/addresses/:id — doc §8.4
 */
export async function deleteAddress(addressId) {
  return apiFetch(`/addresses/${addressId}`, { method: "DELETE" });
}
