import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DESKTOP_MIN_WIDTH, DesktopOnly } from "./DesktopOnly";
import { theme } from "../theme/theme";

const setViewport = (matches) => {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
};

const renderGate = () =>
  render(
    <MantineProvider theme={theme}>
      <DesktopOnly title="Allocate Courses">
        <p>bulk allocation table</p>
      </DesktopOnly>
    </MantineProvider>,
  );

describe("DesktopOnly", () => {
  beforeEach(() => {
    setViewport(false);
  });

  it("renders the page on a wide viewport", () => {
    renderGate();
    expect(screen.getByText("bulk allocation table")).toBeInTheDocument();
  });

  it("replaces the page with guidance on a narrow viewport", () => {
    setViewport(true);
    renderGate();
    expect(screen.queryByText("bulk allocation table")).not.toBeInTheDocument();
    expect(
      screen.getByText(/Open this on a larger screen/),
    ).toBeInTheDocument();
  });

  it("names the page and the width it needs", () => {
    setViewport(true);
    renderGate();
    expect(
      screen.getByText(
        new RegExp(`Allocate Courses.*${DESKTOP_MIN_WIDTH}px`, "s"),
      ),
    ).toBeInTheDocument();
  });

  it("lets the reader through anyway", async () => {
    setViewport(true);
    renderGate();
    await userEvent.click(screen.getByRole("button", { name: /anyway/i }));
    expect(screen.getByText("bulk allocation table")).toBeInTheDocument();
  });
});
