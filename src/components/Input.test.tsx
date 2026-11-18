import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { Input } from "./Input.js";

describe("Input", () => {
  it("links label, error and input for screen readers", () => {
    render(<Input label="Email" error="Required" required />);
    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Required");
    expect(input).toBeRequired();
  });

  it("forwards the ref to the native input", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("toggles password visibility", async () => {
    render(<Input label="Password" type="password" />);
    const input = screen.getByLabelText("Password");
    expect(input).toHaveAttribute("type", "password");
    await userEvent.click(screen.getByRole("button", { name: /show password/i }));
    expect(input).toHaveAttribute("type", "text");
  });

  it("lets className override default classes", () => {
    render(<Input aria-label="x" className="rounded-none" />);
    const cls = screen.getByLabelText("x").className;
    expect(cls).toContain("rounded-none");
    expect(cls).not.toContain("rounded-lg");
  });
});
