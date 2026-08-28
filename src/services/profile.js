// src/services/profile.js
import { apiFetch, setStoredUser } from "./api";

/**
 * GET /api/user/profile — doc §7.1
 */
export async function getProfile() {
  const profile = await apiFetch("/user/profile");
  setStoredUser(profile);
  return profile;
}

/**
 * PUT /api/user/profile — doc §7.2. Uses multipart/form-data whenever an
 * avatar file is attached (required for the upload to work); plain JSON
 * otherwise. All fields are optional — only send what changed.
 */
export async function updateProfile(profileData, imageFile = null) {
  let body;
  const headers = {};

  if (imageFile) {
    const formData = new FormData();
    formData.append("_method", "PUT");
    if (profileData.nameEn) formData.append("name[en]", profileData.nameEn);
    if (profileData.nameAr) formData.append("name[ar]", profileData.nameAr);
    if (profileData.phone) formData.append("phone", profileData.phone);
    if (profileData.password) {
      formData.append("password", profileData.password);
      formData.append("password_confirmation", profileData.password_confirmation);
    }
    formData.append("profile_image", imageFile);
    body = formData;

    const updated = await apiFetch("/user/profile", { method: "POST", body, headers });
    setStoredUser(updated);
    return updated;
  }

  const payload = {};
  if (profileData.nameEn || profileData.nameAr) {
    payload.name = { en: profileData.nameEn || undefined, ar: profileData.nameAr || undefined };
  }
  if (profileData.phone) payload.phone = profileData.phone;
  if (profileData.password) {
    payload.password = profileData.password;
    payload.password_confirmation = profileData.password_confirmation;
  }

  const updated = await apiFetch("/user/profile", { method: "PUT", body: JSON.stringify(payload) });
  setStoredUser(updated);
  return updated;
}
