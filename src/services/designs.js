// src/services/designs.js
import { apiFetch, normalizePaginated } from './api';

// ---------------------------------------------------------------------
// TEMPORARY CLIENT-SIDE CATALOG — API doc §11 / §20 gap #2.
// GET /api/sizes and GET /api/design-options do not exist on the
// backend. These ids are placeholders matching the seeded order on a
// freshly seeded database. Confirm real ids with the backend team, or
// ask them to add the two endpoints and delete this fallback.
// ---------------------------------------------------------------------
export const FALLBACK_SIZES = [
    { id: 1, code: 'XS', name: { en: 'Extra Small', ar: 'صغير جداً' } },
    { id: 2, code: 'S',  name: { en: 'Small', ar: 'صغير' } },
    { id: 3, code: 'M',  name: { en: 'Medium', ar: 'متوسط' } },
    { id: 4, code: 'L',  name: { en: 'Large', ar: 'كبير' } },
    { id: 5, code: 'XL', name: { en: 'Extra Large', ar: 'كبير جداً' } },
    { id: 6, code: 'XXL', name: { en: 'Double Extra Large', ar: 'كبير جداً مضاعف' } },
];

export const FALLBACK_OPTIONS = [
    { id: 1, type: 'fabric_type', name: { en: 'Fabric Material', ar: 'نوع القماش' } },
    { id: 2, type: 'color',       name: { en: 'Garment Color', ar: 'اللون' } },
    { id: 3, type: 'dome_type',   name: { en: 'Collar / Dome Style', ar: 'نوع الياقة' } },
    { id: 4, type: 'sleeve_type', name: { en: 'Sleeve Cut', ar: 'نوع الكم' } },
];

/**
 * GET /api/designs — doc §10.1
 * @param {Object} params - { mode: 'my'|'browse', page, per_page, search,
 *   size_id, price_min, price_max, sort_by, sort_dir }
 * @returns {Promise<{items: Array, page: number, lastPage: number, total: number}>}
 */
export async function getDesigns(params = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            query.set(key, value);
        }
    });
    if (!query.has('mode')) query.set('mode', 'my');

    const paginator = await apiFetch(`/designs?${query.toString()}`);
    return normalizePaginated(paginator);
}

/**
 * GET /api/designs/:id — doc §10.3. Returns the Design resource directly
 * (apiFetch already unwraps the envelope — do not re-read `.data` here).
 */
export async function getDesignById(id) {
    return apiFetch(`/designs/${id}`);
}

function appendDesignFormData(formData, designData) {
    formData.append('name[en]', designData.nameEn);
    if (designData.nameAr) formData.append('name[ar]', designData.nameAr);
    if (designData.descriptionEn) formData.append('description[en]', designData.descriptionEn);
    if (designData.descriptionAr) formData.append('description[ar]', designData.descriptionAr);
    formData.append('price', designData.price);

    designData.sizeIds.forEach((sizeId) => {
        formData.append('size_ids[]', sizeId);
    });

    (designData.options || []).forEach((opt, index) => {
        if (opt.valueEn || opt.valueAr) {
            formData.append(`design_options[${index}][id]`, opt.id);
            if (opt.valueEn) formData.append(`design_options[${index}][value][en]`, opt.valueEn);
            if (opt.valueAr) formData.append(`design_options[${index}][value][ar]`, opt.valueAr);
        }
    });
}

/**
 * POST /api/designs — doc §10.2 (multipart/form-data, required for image upload)
 */
export async function createDesign(designData, fileList) {
    const formData = new FormData();
    appendDesignFormData(formData, designData);
    Array.from(fileList || []).forEach((file) => formData.append('images[]', file));

    return apiFetch('/designs', { method: 'POST', body: formData });
}

/**
 * PUT /api/designs/:id — doc §10.4. Laravel's PUT+multipart quirk means we
 * POST with a _method override so file uploads still work.
 * Sending images[] REPLACES the entire existing image set (doc §10.4/§17)
 * — only pass fileList when the customer actually picked new files.
 */
export async function updateDesign(id, designData, fileList) {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    appendDesignFormData(formData, designData);
    if (fileList && fileList.length) {
        Array.from(fileList).forEach((file) => formData.append('images[]', file));
    }

    return apiFetch(`/designs/${id}`, { method: 'POST', body: formData });
}

/**
 * DELETE /api/designs/:id — doc §10.4. Returns null on success.
 */
export async function deleteDesign(id) {
    return apiFetch(`/designs/${id}`, { method: 'DELETE' });
}
