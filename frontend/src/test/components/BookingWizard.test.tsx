import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import BookingWizard from "../../components/BookingWizard";
import type { Service, TimeSlot } from "../../types";

const mockService: Service = {
  id: 1,
  user_id: 1,
  name: "Test Service",
  description: "A test service",
  duration: 60,
  price: 5000,
  slug: "test-service",
  booking_slug: null,
  timezone: "America/Santiago",
  start_hour: 9,
  end_hour: 18,
  max_capacity: 1,
  created_at: "2026-01-01T00:00:00.000Z",
};

const mockSlot: TimeSlot = {
  start: "2026-07-01T10:00:00.000Z",
  end: "2026-07-01T11:00:00.000Z",
};

describe("BookingWizard", () => {
  it("renders step 1 with form fields", () => {
    render(
      <BookingWizard
        service={mockService}
        slot={mockSlot}
        date="2026-07-01"
        onBack={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: "Tus datos" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Juan Perez")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("+56 9 1234 5678")).toBeInTheDocument();
  });

  it("shows error when name is empty", async () => {
    render(
      <BookingWizard service={mockService} slot={mockSlot} date="2026-07-01" onBack={vi.fn()} onConfirm={vi.fn()} />
    );
    await userEvent.click(screen.getByText("Continuar"));
    expect(screen.getByText("Ingresa tu nombre")).toBeInTheDocument();
  });

  it("shows error when phone is invalid", async () => {
    render(
      <BookingWizard service={mockService} slot={mockSlot} date="2026-07-01" onBack={vi.fn()} onConfirm={vi.fn()} />
    );
    await userEvent.type(screen.getByPlaceholderText("Juan Perez"), "Ana");
    await userEvent.type(screen.getByPlaceholderText("+56 9 1234 5678"), "123");
    await userEvent.click(screen.getByText("Continuar"));
    expect(screen.getByText("Ingresa un WhatsApp valido, ej: +56 9 1234 5678")).toBeInTheDocument();
  });

  it("advances to step 2 when form is valid", async () => {
    render(
      <BookingWizard service={mockService} slot={mockSlot} date="2026-07-01" onBack={vi.fn()} onConfirm={vi.fn()} />
    );
    await userEvent.type(screen.getByPlaceholderText("Juan Perez"), "Ana Torres");
    await userEvent.type(screen.getByPlaceholderText("+56 9 1234 5678"), "9 1234 5678");
    await userEvent.click(screen.getByText("Continuar"));

    expect(screen.getByText("Confirma tu hora")).toBeInTheDocument();
    expect(screen.getByText("Reservar ahora")).toBeInTheDocument();
  });

  it("goes back to step 1 from step 2", async () => {
    render(
      <BookingWizard service={mockService} slot={mockSlot} date="2026-07-01" onBack={vi.fn()} onConfirm={vi.fn()} />
    );
    await userEvent.type(screen.getByPlaceholderText("Juan Perez"), "Ana");
    await userEvent.type(screen.getByPlaceholderText("+56 9 1234 5678"), "9 1234 5678");
    await userEvent.click(screen.getByText("Continuar"));
    await userEvent.click(screen.getByText("Volver"));
    expect(screen.getByRole("heading", { name: "Tus datos" })).toBeInTheDocument();
  });

  it("calls onConfirm with correct data", async () => {
    const onConfirm = vi.fn().mockResolvedValue(null);
    render(
      <BookingWizard service={mockService} slot={mockSlot} date="2026-07-01" onBack={vi.fn()} onConfirm={onConfirm} />
    );
    await userEvent.type(screen.getByPlaceholderText("Juan Perez"), "Ana Torres");
    await userEvent.type(screen.getByPlaceholderText("+56 9 1234 5678"), "9 1234 5678");
    await userEvent.type(screen.getByPlaceholderText("juan@example.com"), "ana@example.com");
    await userEvent.click(screen.getByText("Continuar"));
    await userEvent.click(screen.getByText("Reservar ahora"));

    expect(onConfirm).toHaveBeenCalledWith({
      name: "Ana Torres",
      phone: "9 1234 5678",
      email: "ana@example.com",
      notes: "",
    });
  });

  it("calls onBack when back button is clicked on step 1", async () => {
    const onBack = vi.fn();
    render(
      <BookingWizard service={mockService} slot={mockSlot} date="2026-07-01" onBack={onBack} onConfirm={vi.fn()} />
    );
    await userEvent.click(screen.getByText("Volver"));
    expect(onBack).toHaveBeenCalled();
  });

  it("shows loading state while confirming", async () => {
    let resolveConfirm: (v: string | null) => void = () => {};
    const onConfirm = vi.fn().mockImplementation(
      () => new Promise((resolve) => { resolveConfirm = resolve; })
    );
    render(
      <BookingWizard service={mockService} slot={mockSlot} date="2026-07-01" onBack={vi.fn()} onConfirm={onConfirm} />
    );
    await userEvent.type(screen.getByPlaceholderText("Juan Perez"), "Ana");
    await userEvent.type(screen.getByPlaceholderText("+56 9 1234 5678"), "9 1234 5678");
    await userEvent.click(screen.getByText("Continuar"));
    await userEvent.click(screen.getByText("Reservar ahora"));

    expect(screen.getByText("Enviando...")).toBeInTheDocument();
    resolveConfirm(null);
  });

  it("shows error when onConfirm returns error", async () => {
    const onConfirm = vi.fn().mockResolvedValue("Horario no disponible");
    render(
      <BookingWizard service={mockService} slot={mockSlot} date="2026-07-01" onBack={vi.fn()} onConfirm={onConfirm} />
    );
    await userEvent.type(screen.getByPlaceholderText("Juan Perez"), "Ana");
    await userEvent.type(screen.getByPlaceholderText("+56 9 1234 5678"), "9 1234 5678");
    await userEvent.click(screen.getByText("Continuar"));
    await userEvent.click(screen.getByText("Reservar ahora"));

    expect(await screen.findByText("Horario no disponible")).toBeInTheDocument();
  });
});
