import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ProfileComponent from "./profileComponent";
import { theme } from "../../../ui/theme/theme";

vi.mock("axios", () => ({ default: { put: vi.fn(), post: vi.fn() } }));
vi.mock("@mantine/notifications", () => ({ notifications: { show: vi.fn() } }));

const DATA = {
  profile: { about_me: "Hello", address: "Jabalpur", phone_no: 9999999999 },
  current: [{ user: { email: "s@example.invalid" } }],
};

const show = (readOnly) =>
  render(
    <MantineProvider theme={theme}>
      <ProfileComponent data={DATA} readOnly={readOnly} />
    </MantineProvider>,
  );

describe("ProfileComponent", () => {
  it("can be edited by a present student", () => {
    show(false);
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });

  it("is read-only for an alumnus", () => {
    show(true);
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Edit" }),
    ).not.toBeInTheDocument();
  });
});
