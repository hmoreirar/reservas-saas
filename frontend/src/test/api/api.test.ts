import { describe, it, expect, vi, beforeEach } from "vitest";
import { loginUser, getMyBookings, createPublicBooking, ApiError } from "../../api/api";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe("loginUser", () => {
  it("returns token on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ token: "abc", user: { id: 1, name: "A", email: "a@b.com" } }),
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

  it("throws ApiError with server message on 401", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: "Credenciales invalidas" }),
    });

    await expect(loginUser("a@b.com", "wrong")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
      message: "Credenciales invalidas",
    });
  });

  it("throws ApiError when the network is down", async () => {
    mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    const err = await loginUser("a@b.com", "123").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(0);
    expect(err.message).toContain("conexion");
  });

  it("throws ApiError with generic message when body is not JSON", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => {
        throw new Error("not json");
      },
    });

    const err = await loginUser("a@b.com", "123").catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.message).toContain("500");
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
  it("sends correct body and returns booking", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ booking: { id: 1 } }),
    });

    const result = await createPublicBooking(1, "Juan", "j@b.com", "2026-07-01T10:00:00");
    expect(result.booking.id).toBe(1);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/bookings/public"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("Juan"),
      })
    );
  });
});
