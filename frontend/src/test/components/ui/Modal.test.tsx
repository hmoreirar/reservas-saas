import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import Modal from "../../../components/ui/Modal";

describe("Modal", () => {
  it("does not render when closed", () => {
    render(<Modal open={false} onClose={() => {}} title="Title">Content</Modal>);
    expect(screen.queryByText("Content")).not.toBeInTheDocument();
  });

  it("renders when open", () => {
    render(<Modal open={true} onClose={() => {}} title="Title">Content</Modal>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders title", () => {
    render(<Modal open={true} onClose={() => {}} title="My Title">Content</Modal>);
    expect(screen.getByText("My Title")).toBeInTheDocument();
  });

  it("calls onClose on Escape key", async () => {
    const onClose = vi.fn();
    render(<Modal open={true} onClose={onClose} title="Title">Content</Modal>);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose on backdrop click", async () => {
    const onClose = vi.fn();
    render(<Modal open={true} onClose={onClose} title="Title">Content</Modal>);
    const backdrop = screen.getByText("Content").parentElement;
    if (backdrop) await userEvent.click(backdrop);
    expect(onClose).toHaveBeenCalled();
  });

  it("does not call onClose when clicking inside modal", async () => {
    const onClose = vi.fn();
    render(<Modal open={true} onClose={onClose} title="Title">Content</Modal>);
    await userEvent.click(screen.getByText("Content"));
    expect(onClose).not.toHaveBeenCalled();
  });
});
