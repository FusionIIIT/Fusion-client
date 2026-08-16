import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PageTabs } from "./PageTabs";
import { theme } from "../theme/theme";

const TABS = [
  { value: "0", label: "Notifications", badge: 3 },
  { value: "1", label: "Announcements" },
  { value: "2", label: "Create Announcement" },
];

function setup(props = {}) {
  const onChange = vi.fn();
  render(
    <MantineProvider theme={theme}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <PageTabs value="0" onChange={onChange} tabs={TABS} {...props} />
    </MantineProvider>,
  );
  return { onChange };
}

describe("PageTabs", () => {
  it("renders one tab per entry, in order", () => {
    setup();
    expect(screen.getAllByRole("tab").map((t) => t.textContent.trim())).toEqual(
      ["Notifications3", "Announcements", "Create Announcement"],
    );
  });

  it("marks only the current tab as selected", () => {
    setup({ value: "1" });
    expect(screen.getByRole("tab", { selected: true })).toHaveTextContent(
      "Announcements",
    );
  });

  it("reports a plain tab click, with no caret controls present", async () => {
    const { onChange } = setup();
    await userEvent.click(screen.getByRole("tab", { name: /Announcements/ }));
    expect(onChange).toHaveBeenCalledWith("1");
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });

  it("shows a badge only when the count is positive", () => {
    setup({
      tabs: [
        { value: "0", label: "A", badge: 2 },
        { value: "1", label: "B", badge: 0 },
      ],
    });
    expect(screen.getByRole("tab", { name: /A/ })).toHaveTextContent("2");
    expect(screen.getByRole("tab", { name: /B/ })).toHaveTextContent(/^B$/);
  });

  it("renders nothing when there is only one view to switch between", () => {
    setup({ tabs: [{ value: "0", label: "Only" }] });
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });

  it.each([["md"], [0], [12]])("accepts mb=%s", (mb) => {
    setup({ mb });
    expect(screen.getByRole("tablist")).toBeInTheDocument();
  });
});
