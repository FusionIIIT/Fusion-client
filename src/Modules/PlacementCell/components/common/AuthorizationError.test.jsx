import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { MemoryRouter } from "react-router-dom";

import AuthorizationError from "./AuthorizationError";

function renderWithProviders(ui) {
  return render(
    <MantineProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </MantineProvider>,
  );
}

describe("<AuthorizationError />", () => {
  it("renders the default authorization message and navigation actions", () => {
    renderWithProviders(<AuthorizationError />);
    expect(screen.getByText(/not authorized/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /go back/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /open placement cell/i }),
    ).toBeInTheDocument();
  });

  it("renders a custom message when provided", () => {
    renderWithProviders(
      <AuthorizationError message="Only placement officers allowed" />,
    );
    expect(
      screen.getByText("Only placement officers allowed"),
    ).toBeInTheDocument();
  });
});
