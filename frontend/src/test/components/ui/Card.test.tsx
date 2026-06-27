import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Card from "../../../components/ui/Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Content</Card>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("applies default classes", () => {
    render(<Card>Content</Card>);
    const card = screen.getByText("Content");
    expect(card.className).toContain("rounded-xl");
    expect(card.className).toContain("border-border");
    expect(card.className).toContain("bg-surface");
  });

  it("merges custom className", () => {
    render(<Card className="p-4">Content</Card>);
    expect(screen.getByText("Content").className).toContain("p-4");
  });
});
