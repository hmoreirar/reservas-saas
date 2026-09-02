import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RescheduleModal from "../../components/RescheduleModal";
import type { Booking } from "../../types";

vi.mock("../../api/api", () => ({
  getAvailability: vi.fn(),
}));

import { getAvailability } from "../../api/api";

const mockBooking: Booking = {
  id: 10,
  service_id: 5,
  client_name: "Cliente",
  client_email: "cliente@example.com",
  start_time: "2026-07-01T10:00:00.000Z",
  end_time: "2026-07-01T11:00:00.000Z",
  status: "confirmed",
  notes: null,
  created_at: "2026-01-01T00:00:00.000Z",
  service_name: "Tatuaje",
};

describe("RescheduleModal", () => {
  beforeEach(() => {
    vi.mocked(getAvailability).mockReset();
  });

  it("carga horarios y llama onConfirm con el slot seleccionado", async () => {
    vi.mocked(getAvailability).mockResolvedValue([
      { start: "2026-07-05T10:00:00.000Z", end: "2026-07-05T11:00:00.000Z" },
      { start: "2026-07-05T11:00:00.000Z", end: "2026-07-05T12:00:00.000Z" },
    ]);
    const onConfirm = vi.fn().mockResolvedValue(null);

    render(<RescheduleModal booking={mockBooking} onClose={vi.fn()} onConfirm={onConfirm} />);

    await screen.findByText("Reprogramar reserva");
    expect(getAvailability).toHaveBeenCalledWith(5, expect.any(String));

    const buttons = await screen.findAllByRole("button");
    const slotButtons = buttons.filter(
      (b) => !["Cancelar", "Reprogramar"].includes(b.textContent || "")
    );
    expect(slotButtons.length).toBeGreaterThan(0);
    const firstSlot = slotButtons[0]!;

    await userEvent.click(firstSlot);
    await userEvent.click(screen.getByRole("button", { name: "Reprogramar" }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith("2026-07-05T10:00:00.000Z"));
  });

  it("muestra mensaje cuando no hay horarios", async () => {
    vi.mocked(getAvailability).mockResolvedValue([]);

    render(<RescheduleModal booking={mockBooking} onClose={vi.fn()} onConfirm={vi.fn()} />);

    await screen.findByText("No hay horarios disponibles para esta fecha.");
  });
});
