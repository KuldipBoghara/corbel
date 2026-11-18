import { fireEvent, render, screen } from "@testing-library/react";
import { Avatar } from "./Avatar.js";

describe("Avatar", () => {
  it("falls back to initials when the image fails to load", () => {
    const { container, rerender } = render(<Avatar name="Ada Lovelace King" src="/broken.png" />);
    const img = container.querySelector("img")!;
    expect(img).toBeInTheDocument();
    fireEvent.error(img);
    expect(container.querySelector("img")).toBeNull();
    expect(container).toHaveTextContent("AL");

    // A new src gets a fresh try.
    rerender(<Avatar name="Ada Lovelace King" src="/other.png" />);
    expect(container.querySelector("img")).toHaveAttribute("src", "/other.png");
  });

  it("exposes an accessible name only when alt is given", () => {
    render(<Avatar name="Ada Lovelace" alt="Ada Lovelace" />);
    expect(screen.getByRole("img", { name: "Ada Lovelace" })).toHaveTextContent("AL");
  });
});
