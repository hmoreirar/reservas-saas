import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Routes, Route } from "react-router";
import BookingPage from "../../BookingPage";
import * as api from "../../api/api";
import type { Service, TimeSlot, Booking } from "../../types";

vi.mock("../../api/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../api/api")>();
  return {
    ...actual,
    getServiceBySlug: vi.fn(),
    getPublicAvailability: vi.fn(),
    createPublicBooking: vi.fn(),
  };
});

const mockService: Service = {
  id: 1,
  user_id: 1,
  name: "Corte de pelo",
  description: "Corte clasico",
  duration: 30,
  price: 15000,
  slug: "corte-demo",
  booking_slug: "corte-demo-book",
  timezone: "America/Santiago",
  start_hour: 9,
  end_hour: 18,
  max_capacity: 1,
  created_at: "2026-01-01T00:00:00.000Z",
};

const futureSlot: TimeSlot = {
  start: "2030-01-01T12:00:00.000Z",
  end: "2030-01-01T12:30:00.000Z",
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/book/corte-demo-book"]}>
      <Routes>
        <Route path="/book/:slug" element={<BookingPage />} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.mocked(api.getServiceBySlug).mockResolvedValue(mockService);
  vi.mocked(api.getPublicAvailability).mockResolvedValue([futureSlot]);
});

describe("BookingPage", () => {
  it("muestra error real de la API si falla la disponibilidad", async () => {
    vi.mocked(api.getPublicAvailability).mockRejectedValue(
      new api.ApiError("Error al cargar horarios", 500)
    );
    renderPage();

    expect(await screen.findByText("Corte de pelo")).toBeInTheDocument();
    expect(await screen.findByText("Error al cargar horarios")).toBeInTheDocument();
  });

  it("flujo completo: elegir horario, datos y confirmar la reserva", async () => {
    vi.mocked(api.createPublicBooking).mockResolvedValue({
      booking: { id: 1 } as Booking,
      service: mockService,
    });
    renderPage();

    // elegir el slot disponible y activar el wizard
    const slotButton = await screen.findByRole("button", { name: /09:00/ });
    await userEvent.click(slotButton);
    await userEvent.click(screen.getByText("Reservar"));

    // paso 1: datos del cliente
    await userEvent.type(screen.getByPlaceholderText("Juan Perez"), "Ana Torres");
    await userEvent.type(screen.getByPlaceholderText("+56 9 1234 5678"), "9 1234 5678");
    await userEvent.type(screen.getByPlaceholderText("juan@example.com"), "ana@example.com");
    await userEvent.click(screen.getByText("Continuar"));

    // paso 2: confirmar
    await userEvent.click(screen.getByText("Reservar ahora"));

    await waitFor(() =>
      expect(api.createPublicBooking).toHaveBeenCalledWith(
        1,
        "Ana Torres",
        "9 1234 5678",
        futureSlot.start,
        "ana@example.com",
        ""
      )
    );
    expect(await screen.findByText("Tu hora fue solicitada")).toBeInTheDocument();
  });
});
