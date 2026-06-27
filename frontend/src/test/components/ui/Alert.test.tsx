import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Alert from "../../../components/ui/Alert";

describe("Alert", () => {
  it("renders error variant", () => {
    render(<Alert variant="error">Error message</Alert>);
    expect(screen.getByText("Error message")).toBeInTheDocument();
    expect(screen.getByText("Error message").className).toContain("text-danger");
  });

  it("renders success variant", () => {
    render(<Alert variant="success">Success message</Alert>);
    expect(screen.getByText("Success message")).toBeInTheDocument();
    expect(screen.getByText("Success message").className).toContain("text-accent-text");
  });

  it("renders warning variant", () => {
    render(<Alert variant="warning">Warning message</Alert>);
    expect(screen.getByText("Warning message")).toBeInTheDocument();
    expect(screen.getByText("Warning message").className).toContain("text-warning");
  });

  it("renders info variant", () => {
    render(<Alert variant="info">Info message</Alert>);
    expect(screen.getByText("Info message")).toBeInTheDocument();
    expect(screen.getByText("Info message").className).toContain("text-info");
  });
});
