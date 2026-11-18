import { render, screen } from "@testing-library/react";
import { StatusBadge } from "./Badge.js";

describe("StatusBadge", () => {
  it("maps known statuses to tones and formats the label", () => {
    render(
      <>
        <StatusBadge status="ACTIVE" />
        <StatusBadge status="in-progress" />
        <StatusBadge status="WHATEVER" />
      </>,
    );
    expect(screen.getByText("Active").className).toContain("text-success");
    expect(screen.getByText("In progress").className).toContain("text-info");
    expect(screen.getByText("Whatever").className).toContain("text-text-secondary");
  });

  it("lets tones, tone and formatLabel override the defaults", () => {
    render(
      <>
        <StatusBadge status="ACTIVE" tones={{ active: "primary" }} />
        <StatusBadge status="SHIPPED" tones={{ SHIPPED: "info" }} formatLabel={(s) => `#${s}`} />
        <StatusBadge status="PENDING" tone="error">
          Waiting
        </StatusBadge>
      </>,
    );
    expect(screen.getByText("Active").className).toContain("text-primary");
    expect(screen.getByText("#SHIPPED").className).toContain("text-info");
    expect(screen.getByText("Waiting").className).toContain("text-error");
  });
});
