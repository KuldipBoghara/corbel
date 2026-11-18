import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import { Modal, type ModalProps } from "./Modal.js";

function Harness(props: Partial<ModalProps>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Edit user" description="Details" {...props}>
        <input aria-label="Name" />
      </Modal>
    </>
  );
}

const backdrop = () => document.querySelector('[aria-hidden="true"].fixed') as HTMLElement;

describe("Modal", () => {
  it("is labelled, moves focus in and returns it to the trigger on Escape", async () => {
    render(<Harness />);
    const trigger = screen.getByRole("button", { name: "Open" });
    await userEvent.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "Edit user" });
    expect(dialog).toHaveAccessibleDescription("Details");
    expect(dialog).toHaveFocus();
    expect(document.body.style.overflow).toBe("hidden");

    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(document.body.style.overflow).toBe("");
  });

  it("closes on backdrop click unless closeOnBackdrop is false", async () => {
    const onClose = vi.fn();
    const { rerender } = render(<Modal open onClose={onClose} title="T" />);
    await userEvent.click(backdrop());
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(<Modal open onClose={onClose} title="T" closeOnBackdrop={false} />);
    await userEvent.click(backdrop());
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("busy blocks Escape, backdrop and the close button", async () => {
    const onClose = vi.fn();
    render(<Modal open onClose={onClose} title="T" busy />);
    await userEvent.keyboard("{Escape}");
    await userEvent.click(backdrop());
    expect(screen.getByRole("button", { name: "Close dialog" })).toBeDisabled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("keeps Tab focus inside the dialog", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    const close = screen.getByRole("button", { name: "Close dialog" });
    const input = screen.getByLabelText("Name");
    await userEvent.tab();
    expect(close).toHaveFocus();
    await userEvent.tab();
    expect(input).toHaveFocus();
    await userEvent.tab();
    expect(close).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(input).toHaveFocus();
  });

  it("renders into a custom container", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    render(<Modal open onClose={() => {}} title="T" container={container} />);
    expect(container).toContainElement(screen.getByRole("dialog"));
    container.remove();
  });
});
