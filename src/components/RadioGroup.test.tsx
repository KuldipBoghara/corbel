import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { useState } from "react";
import { RadioGroup, type RadioGroupProps } from "./RadioGroup.js";

const options = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro", description: "$9 / month" },
  { value: "team", label: "Team", disabled: true },
] as const;

type Plan = (typeof options)[number]["value"];

function Harness(props: Partial<RadioGroupProps<Plan>>) {
  const [value, setValue] = useState<Plan | null>(null);
  return <RadioGroup label="Plan" options={options} value={value} onChange={setValue} {...props} />;
}

describe("RadioGroup", () => {
  it("is a labelled group whose radios select on click", async () => {
    render(<Harness />);
    expect(screen.getByRole("radiogroup", { name: "Plan" })).toBeInTheDocument();

    const pro = screen.getByRole("radio", { name: "Pro" });
    expect(pro).toHaveAccessibleDescription("$9 / month");
    await userEvent.click(screen.getByText("Pro"));
    expect(pro).toBeChecked();
    expect(screen.getByRole("radio", { name: "Free" })).not.toBeChecked();
  });

  it("does not select disabled options", async () => {
    const onChange = vi.fn();
    render(<RadioGroup options={options} value={null} onChange={onChange} />);
    expect(screen.getByRole("radio", { name: "Team" })).toBeDisabled();
    await userEvent.click(screen.getByText("Team"));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("shares one name and marks the group invalid on error", () => {
    render(<Harness name="plan" error="Pick a plan" />);
    for (const radio of screen.getAllByRole("radio")) expect(radio).toHaveAttribute("name", "plan");
    const group = screen.getByRole("radiogroup");
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAccessibleDescription("Pick a plan");
  });
});
