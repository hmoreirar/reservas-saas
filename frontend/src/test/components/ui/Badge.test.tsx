import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Badge from "../../../components/ui/Badge";

describe("Badge", () => {
  it("renders count", () => {
    render(<Badge count={5} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("does not render when count is 0", () => {
    const { container } = render(<Badge count={0} />);
    expect(container.firstChild).toBeNull();
  });

  it("shows 99+ for large numbers", () => {
    render(<Badge count={150} />);
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("applies accent variant by default", () => {
    render(<Badge count={3} />);
    expect(screen.getByText("3").className).toContain("bg-accent");
  });
});
