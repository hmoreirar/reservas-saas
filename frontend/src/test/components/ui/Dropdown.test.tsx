import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import Dropdown from "../../../components/ui/Dropdown";

describe("Dropdown", () => {
  it("opens menu on trigger click", async () => {
    render(
      <Dropdown trigger={<button>Menu</button>} items={[{ label: "Option 1", onClick: vi.fn() }]} />
    );
    await userEvent.click(screen.getByText("Menu"));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByText("Option 1")).toBeInTheDocument();
  });

  it("calls item onClick and closes menu", async () => {
    const onClick = vi.fn();
    render(
      <Dropdown trigger={<button>Menu</button>} items={[{ label: "Option 1", onClick }]} />
    );
    await userEvent.click(screen.getByText("Menu"));
    await userEvent.click(screen.getByText("Option 1"));
    expect(onClick).toHaveBeenCalledOnce();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
