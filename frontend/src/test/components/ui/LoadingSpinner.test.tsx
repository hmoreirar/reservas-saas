import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import LoadingSpinner from "../../../components/ui/LoadingSpinner";

describe("LoadingSpinner", () => {
  it("renders spinner", () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeInTheDocument();
  });
});
