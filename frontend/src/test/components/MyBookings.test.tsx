import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import MyBookings from "../../components/MyBookings";
import type { Booking } from "../../types";

const baseBooking: Booking = {
  id: 1,
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

function renderPage(overrides: Partial<React.ComponentProps<typeof MyBookings>> = {}) {
  const props: React.ComponentProps<typeof MyBookings> = {
    bookings: [baseBooking],
    total: 1,
    page: 1,
    totalPages: 1,
    search: "",
    statusFilter: "",
    onSearchChange: vi.fn(),
    onFilterChange: vi.fn(),
    onPageChange: vi.fn(),
    onReschedule: vi.fn(),
    onCancel: vi.fn(),
    onStatusChange: vi.fn(),
    ...overrides,
  };
  return { ...render(<MyBookings {...props} />), props };
}

describe("MyBookings", () => {
  it("muestra las reservas de la lista", () => {
    renderPage();
    expect(screen.getByText(/Ana Torres/)).toBeInTheDocument();
    expect(screen.getByText("Corte de pelo")).toBeInTheDocument();
  });

  it("muestra EmptyState sin reservas y sin filtros", () => {
    renderPage({ bookings: [], total: 0 });
    expect(screen.getByText("No tienes reservas")).toBeInTheDocument();
  });

  it("conserva buscador y filtros cuando la busqueda da 0 resultados", async () => {
    const { props } = renderPage({ bookings: [], total: 0, search: "zzz" });
    expect(screen.getByPlaceholderText("Buscar por nombre o email...")).toBeInTheDocument();
    expect(screen.getByText("Confirmadas")).toBeInTheDocument();
    expect(screen.getByText("No se encontraron reservas con esos criterios.")).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText("Buscar por nombre o email..."), "x");
    expect(props.onSearchChange).toHaveBeenCalled();
  });

  it("pasa el motivo al rechazar una reserva", async () => {
    const { props } = renderPage({
      bookings: [{ ...baseBooking, status: "pending" }],
      total: 1,
    });
    await userEvent.click(screen.getByText("Rechazar"));
    const textarea = screen.getByPlaceholderText("Motivo del rechazo...");
    await userEvent.type(textarea, "Ocupado");
    expect(textarea).toHaveValue("Ocupado");
    const buttons = screen.getAllByText("Rechazar");
    await userEvent.click(buttons[buttons.length - 1]!);

    expect(props.onStatusChange).toHaveBeenCalledWith(1, "declined", "Ocupado");
  });

  it("solo muestra acciones de terminal para reservas canceladas", () => {
    renderPage({
      bookings: [{ ...baseBooking, status: "cancelled", cancellation_reason: "Cliente ocupado" }],
      total: 1,
    });
    expect(screen.queryByText("Rechazar")).not.toBeInTheDocument();
    expect(screen.getAllByText(/Cancelada/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Motivo/)).toBeInTheDocument();
  });
});
