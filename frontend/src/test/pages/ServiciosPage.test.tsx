import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ServiciosPage from "../../pages/ServiciosPage";
import * as api from "../../api/api";
import type { Service } from "../../types";

vi.mock("../../api/api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../api/api")>();
  return {
    ...actual,
    getServices: vi.fn(),
    createService: vi.fn(),
    updateService: vi.fn(),
    deleteService: vi.fn(),
    getServiceHours: vi.fn(),
    updateServiceHours: vi.fn(),
    getServiceBreaks: vi.fn(),
    createServiceBreak: vi.fn(),
    deleteServiceBreak: vi.fn(),
  };
});

const baseService: Service = {
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

beforeEach(() => {
  vi.mocked(api.getServices).mockResolvedValue([baseService]);
  vi.mocked(api.getServiceHours).mockResolvedValue([]);
  vi.mocked(api.getServiceBreaks).mockResolvedValue([]);
  vi.stubGlobal("confirm", () => true);
});

describe("ServiciosPage", () => {
  it("lista los servicios del proveedor", async () => {
    render(<ServiciosPage />);
    expect(await screen.findByText("Corte de pelo")).toBeInTheDocument();
    expect(screen.getByText("Editar")).toBeInTheDocument();
    expect(screen.getByText("Eliminar")).toBeInTheDocument();
  });

  it("editar prellena el formulario y llama updateService", async () => {
    vi.mocked(api.updateService).mockResolvedValue({ ...baseService, name: "Corte nuevo" });

    render(<ServiciosPage />);
    await userEvent.click(await screen.findByText("Editar"));

    const nameInput = await screen.findByLabelText("Nombre del servicio *");
    expect(nameInput).toHaveValue("Corte de pelo");

    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Corte nuevo");
    await waitFor(() => expect(nameInput).toHaveValue("Corte nuevo"));
    await userEvent.click(await screen.findByRole("button", { name: "Guardar cambios" }));

    await waitFor(
      () =>
        expect(api.updateService).toHaveBeenCalledWith(
          1,
          expect.objectContaining({ name: "Corte nuevo" })
        ),
      { timeout: 5000 }
    );
    expect(api.createService).not.toHaveBeenCalled();
  });

  it("crear servicio llama createService con los datos del formulario", async () => {
    vi.mocked(api.createService).mockResolvedValue({ ...baseService, id: 2 });

    render(<ServiciosPage />);
    await userEvent.click(await screen.findByText("+ Nuevo Servicio"));

    const nameInput = await screen.findByLabelText("Nombre del servicio *");
    await userEvent.type(nameInput, "Clase grupal");
    await waitFor(() => expect(nameInput).toHaveValue("Clase grupal"));
    await userEvent.click(await screen.findByRole("button", { name: "Crear Servicio" }));

    await waitFor(
      () =>
        expect(api.createService).toHaveBeenCalledWith(
          expect.objectContaining({ name: "Clase grupal" })
        ),
      { timeout: 5000 }
    );
  });

  it("eliminar servicio llama deleteService con el id", async () => {
    vi.mocked(api.deleteService).mockResolvedValue({ message: "Servicio eliminado" });

    render(<ServiciosPage />);
    await userEvent.click(await screen.findByText("Eliminar"));

    await waitFor(() => expect(api.deleteService).toHaveBeenCalledWith(1), { timeout: 5000 });
  });
});
