import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";

describe("ConfirmDialog", () => {
  it("renders when open", () => {
    render(
      <ConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete?"
        message="Are you sure?"
      />
    );
    expect(screen.getByText("Delete?")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
  });

  it("does not render when closed", () => {
    render(
      <ConfirmDialog
        open={false}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete?"
        message="Are you sure?"
      />
    );
    expect(screen.queryByText("Delete?")).not.toBeInTheDocument();
  });

  it("calls onConfirm when confirm button clicked", async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={onConfirm}
        title="Delete?"
        message="Are you sure?"
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("calls onClose when cancel button clicked", async () => {
    const onClose = vi.fn();
    render(
      <ConfirmDialog
        open={true}
        onClose={onClose}
        onConfirm={vi.fn()}
        title="Delete?"
        message="Are you sure?"
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders custom labels", () => {
    render(
      <ConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete?"
        message="Sure?"
        confirmLabel="Yes"
        cancelLabel="No"
      />
    );
    expect(screen.getByRole("button", { name: "Yes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "No" })).toBeInTheDocument();
  });

  it("renders danger variant by default", () => {
    render(
      <ConfirmDialog
        open={true}
        onClose={vi.fn()}
        onConfirm={vi.fn()}
        title="Delete?"
        message="Sure?"
      />
    );
    const confirmBtn = screen.getByRole("button", { name: "Confirmar" });
    expect(confirmBtn.className).toContain("text-danger");
  });
});
