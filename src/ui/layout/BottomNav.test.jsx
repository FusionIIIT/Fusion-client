import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { BottomNav } from "./BottomNav";
import { theme } from "../theme/theme";

const ITEMS = [
  { code: "bn-home", label: "Home", icon: "House", to: "/dashboard" },
  {
    code: "bn-courses",
    label: "Courses",
    icon: "Book",
    to: "/academics/registered-courses",
  },
];

function setup(props = {}) {
  const onNavigate = vi.fn();
  const onMore = vi.fn();
  render(
    <MantineProvider theme={theme}>
      <BottomNav
        items={ITEMS}
        activeTo="/dashboard"
        onNavigate={onNavigate}
        onMore={onMore}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      />
    </MantineProvider>,
  );
  return { onNavigate, onMore };
}

describe("BottomNav", () => {
  it("always renders More after the given items", () => {
    setup();
    const labels = screen
      .getAllByRole("button")
      .map((b) => b.textContent.trim());
    expect(labels).toEqual(["Home", "Courses", "More"]);
  });

  it("marks the active destination for assistive tech", () => {
    setup();
    expect(screen.getByRole("button", { name: /Home/ })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("button", { name: /Courses/ })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("navigates on tap", async () => {
    const { onNavigate } = setup();
    await userEvent.click(screen.getByRole("button", { name: /Courses/ }));
    expect(onNavigate).toHaveBeenCalledWith("/academics/registered-courses");
  });

  it("opens the drawer from More rather than navigating", async () => {
    const { onNavigate, onMore } = setup();
    await userEvent.click(screen.getByRole("button", { name: /More/ }));
    expect(onMore).toHaveBeenCalledTimes(1);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("is exposed as the primary navigation landmark", () => {
    setup();
    expect(
      screen.getByRole("navigation", { name: "Primary" }),
    ).toBeInTheDocument();
  });
});
