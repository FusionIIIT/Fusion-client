import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ModulePage } from "./ModulePage";
import { pageTitle } from "../../lib/pageTitle";
import { theme } from "../theme/theme";

const renderPage = (props = {}) =>
  render(
    <MantineProvider theme={theme}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <ModulePage title="Registered Courses" {...props}>
        <div>body</div>
      </ModulePage>
    </MantineProvider>,
  );

describe("ModulePage", () => {
  it("renders the title once, as the page heading", () => {
    renderPage();
    const headings = screen.getAllByRole("heading", {
      name: "Registered Courses",
    });
    expect(headings).toHaveLength(1);
  });

  it("sets the browser tab title from the page title", () => {
    renderPage();
    expect(document.title).toBe(pageTitle("Registered Courses"));
  });

  it("updates the tab title when the page changes", () => {
    const { unmount } = renderPage();
    unmount();
    renderPage({ title: "Swayam" });
    expect(document.title).toBe(pageTitle("Swayam"));
  });

  it("renders the subtitle and action when given", () => {
    renderPage({
      subtitle: "Your credit standing",
      action: <button type="button">Download</button>,
    });
    expect(screen.getByText("Your credit standing")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Download" }),
    ).toBeInTheDocument();
  });
});
