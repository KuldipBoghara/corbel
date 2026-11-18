import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { createRef } from "react";
import { Checkbox } from "./Checkbox.js";

describe("Checkbox", () => {
  it("sets the native indeterminate flag and keeps it across clicks", async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <Checkbox label="All" checked={false} indeterminate onChange={onChange} />,
    );
    const box = screen.getByRole("checkbox", { name: "All" });
    expect(box).toBePartiallyChecked();
    await userEvent.click(box);
    expect(onChange).toHaveBeenCalled();
    rerender(<Checkbox label="All" checked={false} indeterminate onChange={onChange} />);
    expect(box).toBePartiallyChecked();
    rerender(<Checkbox label="All" checked indeterminate={false} onChange={onChange} />);
    expect(box).not.toBePartiallyChecked();
    expect(box).toBeChecked();
  });

  it("forwards the ref and links the description", () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox ref={ref} label="Terms" description="You must agree" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(screen.getByRole("checkbox")).toHaveAccessibleDescription("You must agree");
  });
});
