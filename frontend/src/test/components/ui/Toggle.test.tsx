import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import Toggle from "../../../components/ui/Toggle";

describe("Toggle", () => {
  it("renders label and description", () => {
    render(<Toggle checked={false} onChange={vi.fn()} label="Dark mode" description="Toggle theme" />);
    expect(screen.getByText("Dark mode")).toBeInTheDocument();
    expect(screen.getByText("Toggle theme")).toBeInTheDocument();
  });

  it("calls onChange when clicked", async () => {
    const onChange = vi.fn();
    render(<Toggle checked={false} onChange={onChange} label="Dark mode" />);
    await userEvent.click(screen.getByText("Dark mode"));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("shows checked state", () => {
    render(<Toggle checked={true} onChange={vi.fn()} label="Dark mode" />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });
});
