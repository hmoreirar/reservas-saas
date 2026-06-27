import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

describe("LoadingSpinner", () => {
  it("renders spinner with default size", () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
    expect(spinner?.className).toContain("h-10");
  });

  it("renders spinner with sm size", () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
    expect(spinner?.className).toContain("h-5");
  });

  it("renders spinner with lg size", () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
    expect(spinner?.className).toContain("h-14");
  });
});
