import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import { OtpInput } from "./OtpInput.js";

function Harness({ onComplete }: { onComplete?: (v: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <>
      <OtpInput label="Code" length={4} value={value} onChange={setValue} onComplete={onComplete} />
      <output data-testid="value">{value}</output>
    </>
  );
}

const boxes = () => screen.getAllByRole("textbox") as HTMLInputElement[];

describe("OtpInput", () => {
  it("advances as digits are typed, ignores non-digits and fires onComplete", async () => {
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);
    await userEvent.click(boxes()[0]!);
    await userEvent.keyboard("1a23");
    expect(boxes()[3]).toHaveFocus();
    expect(onComplete).not.toHaveBeenCalled();
    await userEvent.keyboard("4");
    expect(screen.getByTestId("value")).toHaveTextContent("1234");
    expect(onComplete).toHaveBeenCalledWith("1234");
  });

  it("fills every box from a paste", async () => {
    const onComplete = vi.fn();
    render(<Harness onComplete={onComplete} />);
    await userEvent.click(boxes()[0]!);
    await userEvent.paste("98-76");
    expect(boxes().map((b) => b.value)).toEqual(["9", "8", "7", "6"]);
    expect(onComplete).toHaveBeenCalledWith("9876");
  });

  it("Backspace on an empty box clears the previous one and moves back", async () => {
    render(<Harness />);
    await userEvent.click(boxes()[0]!);
    await userEvent.keyboard("12");
    expect(boxes()[2]).toHaveFocus();
    await userEvent.keyboard("{Backspace}");
    expect(screen.getByTestId("value")).toHaveTextContent(/^1$/);
    expect(boxes()[1]).toHaveFocus();
  });

  it("moves with arrow keys and redirects clicks past the first gap", async () => {
    render(<Harness />);
    await userEvent.click(boxes()[3]!);
    expect(boxes()[0]).toHaveFocus();
    await userEvent.keyboard("12{ArrowLeft}");
    expect(boxes()[1]).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(boxes()[2]).toHaveFocus();
  });

  it("names the group and marks every box invalid on error", () => {
    render(<OtpInput label="Code" value="" onChange={() => {}} error="Wrong code" />);
    expect(screen.getByRole("group", { name: "Code" })).toBeInTheDocument();
    for (const box of boxes()) {
      expect(box).toHaveAttribute("aria-invalid", "true");
      expect(box).toHaveAccessibleDescription("Wrong code");
    }
  });
});
