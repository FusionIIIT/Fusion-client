import { MantineProvider } from "@mantine/core";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AppShellLayout } from "./AppShellLayout";
import { theme } from "../theme/theme";

const NAV = [
  {
    section: "Overview",
    items: [
      { code: "home", label: "Dashboard", icon: "House", to: "/dashboard" },
    ],
  },
  {
    section: "Academics",
    items: [
      {
        code: "Academics:Registration",
        label: "Registration",
        icon: "ClipboardText",
        links: [
          {
            code: "sc",
            label: "Student Courses",
            icon: "Book",
            to: "/academics/student-courses",
          },
        ],
      },
      {
        code: "Academics:Course Changes",
        label: "Course Changes",
        icon: "ArrowsLeftRight",
        links: [
          {
            code: "sw",
            label: "Swayam",
            icon: "BookOpenText",
            to: "/academics/swayam",
          },
        ],
      },
    ],
  },
];

function setup(props = {}) {
  const onNavigate = vi.fn();
  const onRoleChange = vi.fn();
  render(
    <MantineProvider theme={theme}>
      <AppShellLayout
        navGroups={NAV}
        activePath="/dashboard"
        onNavigate={onNavigate}
        brandSubtitle="FUSION · ERP PORTAL"
        user={{ name: "Dr. Asha Verma", roleLabel: "acadadmin" }}
        onLogout={vi.fn()}
        onRoleChange={onRoleChange}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      >
        <div>page body</div>
      </AppShellLayout>
    </MantineProvider>,
  );
  return { onNavigate, onRoleChange };
}

describe("AppShellLayout", () => {
  it("renders the brand lockup and the page body", () => {
    setup();
    expect(screen.getByText("JABALPUR")).toBeInTheDocument();
    expect(screen.getByText("FUSION · ERP PORTAL")).toBeInTheDocument();
    expect(screen.getByText("page body")).toBeInTheDocument();
  });

  it("shows identity in the sidebar footer, with honorifics skipped", () => {
    setup();
    expect(screen.getByText("AV")).toBeInTheDocument();
    expect(screen.getByText("Dr. Asha Verma")).toBeInTheDocument();
    expect(screen.getByText("acadadmin")).toBeInTheDocument();
  });

  it("opens the group that owns the active path", () => {
    setup({ activePath: "/academics/swayam" });
    expect(screen.getByText("Swayam")).toBeVisible();
  });

  it("navigates when a link is clicked", async () => {
    const { onNavigate } = setup({ activePath: "/academics/swayam" });
    await userEvent.click(screen.getByText("Swayam"));
    expect(onNavigate).toHaveBeenCalledWith("/academics/swayam");
  });

  it("finds a link by search without opening its group", async () => {
    setup();
    await userEvent.type(screen.getByPlaceholderText("Search"), "swayam");
    expect(screen.getByText("Swayam")).toBeInTheDocument();
    expect(screen.getByText("Course Changes")).toBeInTheDocument();
    expect(screen.queryByText("Student Courses")).not.toBeInTheDocument();
  });

  it("says so when a search matches nothing", async () => {
    setup();
    await userEvent.type(screen.getByPlaceholderText("Search"), "zzzz");
    expect(screen.getByText("No matches")).toBeInTheDocument();
  });

  it("shows the role as plain text when the user has a single role", () => {
    setup({ roles: ["student"], role: "student" });
    expect(screen.queryByLabelText("Switch role")).not.toBeInTheDocument();
    expect(screen.getByText("acadadmin")).toBeInTheDocument();
  });

  it("turns the footer role line into the switcher for a multi-role user", async () => {
    const { onRoleChange } = setup({
      roles: ["student", "acadadmin"],
      role: "acadadmin",
    });
    const switcher = screen.getByLabelText("Switch role");
    expect(switcher).toHaveValue("acadadmin");
    await userEvent.selectOptions(switcher, "student");
    expect(onRoleChange).toHaveBeenCalledWith("student");
  });

  it("lists every role the user holds", () => {
    setup({
      roles: ["student", "acadadmin", "Dean Academic"],
      role: "student",
    });
    expect(
      within(screen.getByLabelText("Switch role"))
        .getAllByRole("option")
        .map((o) => o.textContent),
    ).toEqual(["student", "acadadmin", "Dean Academic"]);
  });

  it("badges the unread notification count", () => {
    setup({ unreadCount: 137 });
    const bell = screen.getByLabelText("Notifications");
    expect(within(bell.parentElement).getByText("99+")).toBeInTheDocument();
  });

  it("keeps the header free of the role switcher", () => {
    setup({
      roles: ["student", "acadadmin"],
      role: "acadadmin",
      unreadCount: 2,
    });
    const bell = screen.getByLabelText("Notifications");
    const switcher = screen.getByLabelText("Switch role");
    expect(bell.closest("header")).not.toBeNull();
    expect(switcher.closest("header")).toBeNull();
    expect(screen.getAllByLabelText("Switch role")).toHaveLength(1);
  });
});
