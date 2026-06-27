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
  service_type: "individual",
  is_package: false,
  allow_multiple: false,
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

    expect(screen.getByText("Resumen de la reserva")).toBeInTheDocument();
    expect(screen.getByText("Test Service")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Juan Perez")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("juan@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Informacion adicional...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Atras" })).toBeInTheDocument();
  });

  it("shows error when name is empty", async () => {
    render(
      <BookingWizard
        service={mockService}
        slot={mockSlot}
        date="2026-07-01"
        onBack={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByText("Por favor ingresa tu nombre")).toBeInTheDocument();
  });

  it("shows error when email is invalid", async () => {
    render(
      <BookingWizard
        service={mockService}
        slot={mockSlot}
        date="2026-07-01"
        onBack={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    await userEvent.type(screen.getByPlaceholderText("Juan Perez"), "Juan");
    await userEvent.type(screen.getByPlaceholderText("juan@example.com"), "not-an-email");
    await userEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(screen.getByText("Ingresa un email valido")).toBeInTheDocument();
  });

  it("advances to step 2 when form is valid", async () => {
    render(
      <BookingWizard
        service={mockService}
        slot={mockSlot}
        date="2026-07-01"
        onBack={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    await userEvent.type(screen.getByPlaceholderText("Juan Perez"), "Juan Pérez");
    await userEvent.type(screen.getByPlaceholderText("juan@example.com"), "juan@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Continuar" }));

    expect(screen.getByText("Confirma tu reserva")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmar reserva" })).toBeInTheDocument();
  });

  it("goes back to step 1 from step 2", async () => {
    render(
      <BookingWizard
        service={mockService}
        slot={mockSlot}
        date="2026-07-01"
        onBack={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    await userEvent.type(screen.getByPlaceholderText("Juan Perez"), "Juan");
    await userEvent.type(screen.getByPlaceholderText("juan@example.com"), "juan@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Continuar" }));
    await userEvent.click(screen.getByRole("button", { name: "Atras" }));

    expect(screen.getByText("Resumen de la reserva")).toBeInTheDocument();
  });

  it("calls onConfirm with correct data", async () => {
    const onConfirm = vi.fn().mockResolvedValue(null);
    render(
      <BookingWizard
        service={mockService}
        slot={mockSlot}
        date="2026-07-01"
        onBack={vi.fn()}
        onConfirm={onConfirm}
      />
    );

    await userEvent.type(screen.getByPlaceholderText("Juan Perez"), "Juan Pérez");
    await userEvent.type(screen.getByPlaceholderText("juan@example.com"), "juan@example.com");
    await userEvent.type(screen.getByPlaceholderText("Informacion adicional..."), "Nota test");
    await userEvent.click(screen.getByRole("button", { name: "Continuar" }));
    await userEvent.click(screen.getByRole("button", { name: "Confirmar reserva" }));

    expect(onConfirm).toHaveBeenCalledWith("Juan Pérez", "juan@example.com", "Nota test");
  });

  it("calls onBack when back button is clicked on step 1", async () => {
    const onBack = vi.fn();
    render(
      <BookingWizard
        service={mockService}
        slot={mockSlot}
        date="2026-07-01"
        onBack={onBack}
        onConfirm={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Atras" }));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("shows loading state while confirming", async () => {
    const onConfirm = vi.fn().mockReturnValue(new Promise(() => {})); // never resolves
    render(
      <BookingWizard
        service={mockService}
        slot={mockSlot}
        date="2026-07-01"
        onBack={vi.fn()}
        onConfirm={onConfirm}
      />
    );

    await userEvent.type(screen.getByPlaceholderText("Juan Perez"), "Juan");
    await userEvent.type(screen.getByPlaceholderText("juan@example.com"), "juan@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Continuar" }));
    await userEvent.click(screen.getByRole("button", { name: "Confirmar reserva" }));

    expect(screen.getByRole("button", { name: "Confirmando..." })).toBeDisabled();
  });

  it("shows error when onConfirm returns error", async () => {
    const onConfirm = vi.fn().mockResolvedValue("Error del servidor");
    render(
      <BookingWizard
        service={mockService}
        slot={mockSlot}
        date="2026-07-01"
        onBack={vi.fn()}
        onConfirm={onConfirm}
      />
    );

    await userEvent.type(screen.getByPlaceholderText("Juan Perez"), "Juan");
    await userEvent.type(screen.getByPlaceholderText("juan@example.com"), "juan@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Continuar" }));
    await userEvent.click(screen.getByRole("button", { name: "Confirmar reserva" }));

    expect(screen.getByText("Error del servidor")).toBeInTheDocument();
  });
});
