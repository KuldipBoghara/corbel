import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import { SegmentedControl, type SegmentedOption } from "./SegmentedControl.js";

type Answer = "yes" | "maybe" | "no";
const options: SegmentedOption<Answer>[] = [
  { value: "yes", label: "Yes", tone: "success", hint: "Good to go" },
  { value: "maybe", label: "Maybe", disabled: true },
  { value: "no", label: "No", tone: "error" },
];

function Harness() {
  const [value, setValue] = useState<Answer | "">("");
  return <SegmentedControl label="Usable?" options={options} value={value} onChange={setValue} />;
}

describe("SegmentedControl", () => {
  it("is a labelled radiogroup with one tab stop", async () => {
    render(<Harness />);
    expect(screen.getByRole("radiogroup", { name: "Usable?" })).toBeInTheDocument();
    await userEvent.tab();
    expect(screen.getByRole("radio", { name: "Yes" })).toHaveFocus();
    await userEvent.tab();
    expect(document.body).toHaveFocus();
  });

  it("arrow keys move and select, skipping disabled options and wrapping", async () => {
    render(<Harness />);
    await userEvent.click(screen.getByRole("radio", { name: "Yes" }));
    expect(screen.getByRole("radio", { name: "Yes" })).toBeChecked();
    expect(screen.getByRole("radiogroup")).toHaveAccessibleDescription("Good to go");

    await userEvent.keyboard("{ArrowRight}");
    const no = screen.getByRole("radio", { name: "No" });
    expect(no).toHaveFocus();
    expect(no).toBeChecked();

    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Yes" })).toBeChecked();
    await userEvent.keyboard("{End}");
    expect(no).toBeChecked();
  });
});
