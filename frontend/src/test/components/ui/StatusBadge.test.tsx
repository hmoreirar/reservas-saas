import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import StatusBadge from "../../../components/ui/StatusBadge";

describe("StatusBadge", () => {
  it("renders pending status", () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
  });

  it("renders confirmed status", () => {
    render(<StatusBadge status="confirmed" />);
    expect(screen.getByText("Confirmada")).toBeInTheDocument();
  });

  it("renders completed status", () => {
    render(<StatusBadge status="completed" />);
    expect(screen.getByText("Completada")).toBeInTheDocument();
  });

  it("renders cancelled status", () => {
    render(<StatusBadge status="cancelled" />);
    expect(screen.getByText("Cancelada")).toBeInTheDocument();
  });

  it("renders no-show status", () => {
    render(<StatusBadge status="no-show" />);
    expect(screen.getByText("No asistio")).toBeInTheDocument();
  });

  it("renders unknown status as-is", () => {
    render(<StatusBadge status="unknown" />);
    expect(screen.getByText("unknown")).toBeInTheDocument();
  });

  it("renders colored dot", () => {
    render(<StatusBadge status="pending" />);
    const badge = screen.getByText("Pendiente");
    const dot = badge.firstElementChild;
    expect(dot?.className).toContain("rounded-full");
  });

  it("applies custom className", () => {
    render(<StatusBadge status="confirmed" className="ml-2" />);
    expect(screen.getByText("Confirmada").className).toContain("ml-2");
  });
});
