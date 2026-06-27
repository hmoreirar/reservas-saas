import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import Tooltip from "../../../components/ui/Tooltip";

describe("Tooltip", () => {
  it("shows tooltip content on hover", async () => {
    render(<Tooltip content="Help text"><button>Hover me</button></Tooltip>);
    await userEvent.hover(screen.getByRole("button"));
    await new Promise((r) => setTimeout(r, 400));
    expect(screen.getByRole("tooltip")).toHaveTextContent("Help text");
  });
});
