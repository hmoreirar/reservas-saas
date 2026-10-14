import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ReservasPage from "../../pages/ReservasPage";
import * as api from "../../api/api";
import type { Booking } from "../../types";

vi.mock("../../api/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../api/api")>();
  return {
    ...actual,
    getMyBookings: vi.fn(),
    cancelBooking: vi.fn(),
    rescheduleBooking: vi.fn(),
    updateBookingStatus: vi.fn(),
    getAvailability: vi.fn(),
  };
});

const baseBooking: Booking = {
  id: 7,
  service_id: 1,
  client_name: "Ana Torres",
  client_phone: '+56 9 1234 5678',
  client_email: "ana@example.com",
  start_time: "2030-01-01T12:00:00.000Z",
  end_time: "2030-01-01T12:30:00.000Z",
  status: "confirmed",
  notes: null,
  created_at: "2026-01-01T00:00:00.000Z",
  service_name: "Corte de pelo",
};

const emptyPage = { data: [], total: 0, page: 1, limit: 20, totalPages: 1 };

beforeEach(() => {
  vi.mocked(api.getMyBookings).mockResolvedValue({
    data: [baseBooking],
    total: 1,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  vi.mocked(api.getAvailability).mockResolvedValue([]);
  vi.stubGlobal("confirm", () => true);
});

describe("ReservasPage", () => {
  it("muestra las reservas y los controles de busqueda", async () => {
    render(<ReservasPage />);
    expect(await screen.findByText(/Ana Torres/)).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Buscar por nombre o email...")).toBeInTheDocument();
  });

  it("busca con debounce, no por cada tecla", async () => {
    render(<ReservasPage />);
    await screen.findByText(/Ana Torres/);
    const callsBefore = vi.mocked(api.getMyBookings).mock.calls.length;

    await userEvent.type(screen.getByPlaceholderText("Buscar por nombre o email..."), "an");
    // inmediatamente despues de tipear no deberia haber nuevas llamadas
    expect(vi.mocked(api.getMyBookings).mock.calls.length).toBe(callsBefore);

    await waitFor(
      () => expect(vi.mocked(api.getMyBookings)).toHaveBeenCalledWith(1, 20, "an", undefined, expect.anything()),
      { timeout: 1500 }
    );
  });

  it("mantiene los filtros visibles cuando la busqueda no tiene resultados", async () => {
    vi.mocked(api.getMyBookings)
      .mockResolvedValueOnce({ data: [baseBooking], total: 1, page: 1, limit: 20, totalPages: 1 })
      .mockResolvedValue(emptyPage);
    render(<ReservasPage />);
    await screen.findByText(/Ana Torres/);

    await userEvent.type(screen.getByPlaceholderText("Buscar por nombre o email..."), "zzz");

    await waitFor(
      () => expect(screen.getByText("No se encontraron reservas con esos criterios.")).toBeInTheDocument(),
      { timeout: 1500 }
    );
    expect(screen.getByPlaceholderText("Buscar por nombre o email...")).toBeInTheDocument();
  });

  it("cancelar reserva llama cancelBooking", async () => {
    vi.mocked(api.cancelBooking).mockResolvedValue({ message: "Reserva cancelada" });
    render(<ReservasPage />);
    await userEvent.click(await screen.findByText("Cancelar"));

    await userEvent.click(screen.getByRole("button", { name: "Cancelar reserva" }));
    await waitFor(() => expect(api.cancelBooking).toHaveBeenCalledWith(7));
  });
});
