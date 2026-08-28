import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  apiFetch,
  setToken,
  removeToken,
  flattenValidationErrors,
  normalizePaginated,
} from "./api";

describe("api helpers", () => {
  it("flattens validation errors", () => {
    const errors = flattenValidationErrors({
      phone: ["required"],
      password: "short",
    });
    expect(errors.phone).toEqual(["required"]);
    expect(errors.password).toEqual(["short"]);
  });

  it("normalizes a Resource-collection paginator (designs/addresses/orders)", () => {
    const result = normalizePaginated({
      data: [{ id: 1 }, { id: 2 }],
      meta: { current_page: 1, last_page: 3, total: 6 },
    });
    expect(result.items).toHaveLength(2);
    expect(result.lastPage).toBe(3);
    expect(result.total).toBe(6);
  });

  it("normalizes a raw Laravel paginator (wallet transactions)", () => {
    const result = normalizePaginated({
      current_page: 2,
      data: [{ id: 11 }],
      last_page: 4,
      total: 40,
    });
    expect(result.items).toEqual([{ id: 11 }]);
    expect(result.page).toBe(2);
    expect(result.lastPage).toBe(4);
  });
});

describe("apiFetch", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    localStorage.clear();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("unwraps success envelope to data payload", async () => {
    global.fetch.mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: async () => ({ success: true, data: { id: 1 }, message: "ok" }),
    });

    const payload = await apiFetch("/any");
    expect(payload).toEqual({ id: 1 });
  });

  it("throws validation error shape for 422", async () => {
    global.fetch.mockResolvedValueOnce({
      status: 422,
      ok: false,
      json: async () => ({
        message: "Validation failed",
        errors: { phone: ["required"] },
      }),
    });

    await expect(
      apiFetch("/auth/login", { method: "POST", body: JSON.stringify({}) }),
    ).rejects.toMatchObject({
      type: "validation",
      status: 422,
      errors: { phone: ["required"] },
    });
  });

  it("throws a forbidden error shape for 403", async () => {
    global.fetch.mockResolvedValueOnce({
      status: 403,
      ok: false,
      json: async () => ({ message: "This action is unauthorized." }),
    });

    await expect(apiFetch("/addresses/99", { method: "DELETE" })).rejects.toMatchObject({
      type: "forbidden",
      status: 403,
    });
  });

  it("clears token and throws auth error on 401", async () => {
    setToken("abc");

    global.fetch.mockResolvedValueOnce({
      status: 401,
      ok: false,
      json: async () => ({ message: "Unauthenticated." }),
    });

    await expect(apiFetch("/user/profile")).rejects.toMatchObject({
      type: "auth",
      status: 401,
    });
    expect(localStorage.getItem("kandura_access_token")).toBeNull();
    removeToken();
  });
});
