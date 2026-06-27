import { describe, it, expect, vi, beforeEach } from "vitest";
import { loginUser, getMyBookings, createPublicBooking } from "../../api/api";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe("loginUser", () => {
  it("returns token on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: "abc" }),
    });

    const result = await loginUser("a@b.com", "123");
    expect(result.token).toBe("abc");
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/auth/login"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("a@b.com"),
      })
    );
  });

  it("returns error when request fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: "Credenciales invalidas" }),
    });

    const result = await loginUser("a@b.com", "wrong");
    expect(result.error).toBe("Credenciales invalidas");
  });

  it("returns generic error on network failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => { throw new Error("not json"); },
    });

    const result = await loginUser("a@b.com", "123");
    expect(result.error).toContain("500");
  });
});

describe("getMyBookings", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", { getItem: () => "token" });
  });

  it("returns paginated response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: [{ id: 1, client_name: "Juan" }],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      }),
    });

    const result = await getMyBookings(1, 20);
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
  });
});

describe("createPublicBooking", () => {
  it("sends correct body", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ booking: { id: 1 } }),
    });

    const result = await createPublicBooking(1, "Juan", "j@b.com", "2026-07-01T10:00:00");
    expect(result.booking?.id).toBe(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/bookings/public"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("Juan"),
      })
    );
  });
});
