import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import Tabs from "../../../components/ui/Tabs";

const tabs = [
  { id: "one", label: "One" },
  { id: "two", label: "Two" },
  { id: "three", label: "Three" },
];

describe("Tabs", () => {
  it("renders all tabs", () => {
    render(<Tabs tabs={tabs} active="one" onChange={vi.fn()} />);
    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
    expect(screen.getByText("Three")).toBeInTheDocument();
  });

  it("calls onChange with tab id", async () => {
    const onChange = vi.fn();
    render(<Tabs tabs={tabs} active="one" onChange={onChange} />);
    await userEvent.click(screen.getByText("Two"));
    expect(onChange).toHaveBeenCalledWith("two");
  });
});
