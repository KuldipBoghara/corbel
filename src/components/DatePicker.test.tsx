import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { DatePicker, parseISODate, parseTypedDate, toISODate } from "./DatePicker.js";

describe("date parsing", () => {
  it("parses typed DD/MM/YYYY with any separator and rejects impossible dates", () => {
    expect(toISODate(parseTypedDate("05/03/2024")!)).toBe("2024-03-05");
    expect(toISODate(parseTypedDate("5-3-2024")!)).toBe("2024-03-05");
    expect(toISODate(parseTypedDate("29.02.2024")!)).toBe("2024-02-29");
    expect(parseTypedDate("31/02/2024")).toBeNull();
    expect(parseTypedDate("29/02/2023")).toBeNull();
    expect(parseTypedDate("12/13/2024")).toBeNull();
    expect(parseTypedDate("hello")).toBeNull();
  });

  it("parses YYYY-MM-DD without timezone shift", () => {
    const d = parseISODate("2024-01-31")!;
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2024, 0, 31]);
    expect(parseISODate("2024-02-30")).toBeNull();
    expect(parseISODate("")).toBeNull();
  });
});

describe("DatePicker", () => {
  it("commits a typed date on blur and shows it as DD/MM/YYYY", async () => {
    const onChange = vi.fn();
    render(<DatePicker label="Due" value="" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Due"), "15/03/2024");
    await userEvent.tab();
    expect(onChange).toHaveBeenCalledWith("2024-03-15");
  });

  it("reverts invalid or out-of-range text", async () => {
    const onChange = vi.fn();
    render(<DatePicker label="Due" value="2024-03-10" onChange={onChange} min="2024-03-01" max="2024-03-31" />);
    const input = screen.getByLabelText("Due");
    expect(input).toHaveValue("10/03/2024");

    await userEvent.clear(input);
    await userEvent.type(input, "31/02/2024{Enter}");
    expect(input).toHaveValue("10/03/2024");

    await userEvent.clear(input);
    await userEvent.type(input, "01/04/2024{Enter}");
    expect(input).toHaveValue("10/03/2024");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("clears when the text is emptied", async () => {
    const onChange = vi.fn();
    render(<DatePicker label="Due" value="2024-03-10" onChange={onChange} />);
    await userEvent.clear(screen.getByLabelText("Due"));
    await userEvent.tab();
    expect(onChange).toHaveBeenCalledWith("");
  });

  it("picks from the calendar and disables days outside min/max", async () => {
    const onChange = vi.fn();
    render(<DatePicker label="Due" value="2024-03-10" onChange={onChange} min="2024-03-05" max="2024-03-20" />);
    await userEvent.click(screen.getByRole("button", { name: "Open calendar" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("March 2024");
    expect(screen.getByRole("button", { name: "04/03/2024" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "21/03/2024" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "10/03/2024" })).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(screen.getByRole("button", { name: "12/03/2024" }));
    expect(onChange).toHaveBeenCalledWith("2024-03-12");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("navigates months and closes on Escape", async () => {
    render(<DatePicker label="Due" value="2024-12-10" onChange={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Open calendar" }));
    await userEvent.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("January 2025");
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
