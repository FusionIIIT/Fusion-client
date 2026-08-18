import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AppShellLayout } from "./AppShellLayout";
import { theme } from "../theme/theme";

const realMatchMedia = window.matchMedia;

afterEach(() => {
  window.matchMedia = realMatchMedia;
});

function matchWidth(width) {
  window.matchMedia = vi.fn().mockImplementation((query) => {
    const max = /max-width:\s*(\d+)px/.exec(query);
    return {
      matches: max ? width <= Number(max[1]) : false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  });
}

async function collapseAndStepAway(user) {
  await user.click(screen.getByLabelText("Collapse sidebar"));
  await user.unhover(screen.getByLabelText("Main navigation"));
}

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

  it("gives every link a real href so it is keyboard-reachable", () => {
    setup();
    const dashboard = screen.getByText("Dashboard").closest("a");
    expect(dashboard).toHaveAttribute("href", "/dashboard");
  });

  it("leaves a modified click to the browser so a link can open in a new tab", async () => {
    const user = userEvent.setup();
    const { onNavigate } = setup({ activePath: "/academics/swayam" });
    await user.keyboard("{Meta>}");
    await user.click(screen.getByText("Swayam"));
    await user.keyboard("{/Meta}");
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("marks the active link for assistive tech", () => {
    setup({ activePath: "/academics/swayam" });
    expect(screen.getByText("Swayam").closest("a")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("exposes each group as an expandable control", () => {
    setup({ activePath: "/academics/swayam" });
    expect(
      screen.getByText("Course Changes").closest("button"),
    ).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Registration").closest("button")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("keeps a group open when another one is opened", async () => {
    setup({ activePath: "/academics/swayam" });
    await userEvent.click(screen.getByText("Registration"));
    expect(
      screen.getByText("Course Changes").closest("button"),
    ).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Registration").closest("button")).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("flags a collapsed group that holds the current page", async () => {
    setup({ activePath: "/academics/swayam" });
    const group = screen.getByText("Course Changes").closest("button");
    expect(group).not.toHaveAttribute("data-holds-active");
    await userEvent.click(group);
    expect(group).toHaveAttribute("data-holds-active", "true");
  });

  it("collapses the sidebar to an icon rail and back", async () => {
    setup();
    await userEvent.click(screen.getByLabelText("Collapse sidebar"));
    expect(screen.queryByPlaceholderText("Search")).not.toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("Expand sidebar"));
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
  });

  it("pins itself open when a group is tapped with no hover to peek", async () => {
    setup();
    await userEvent.click(screen.getByLabelText("Collapse sidebar"));
    fireEvent.click(screen.getByText("Registration"));
    expect(screen.getByLabelText("Collapse sidebar")).toBeInTheDocument();
    expect(screen.getByText("Student Courses")).toBeVisible();
  });

  it("does not pin itself open when a group is clicked while peeking", async () => {
    const user = userEvent.setup();
    setup();
    await collapseAndStepAway(user);
    const navbar = screen.getByLabelText("Main navigation");

    await user.hover(navbar);
    await screen.findByPlaceholderText("Search");
    await user.click(screen.getByText("Registration"));
    expect(screen.getByText("Student Courses")).toBeVisible();
    expect(screen.getByLabelText("Expand sidebar")).toBeInTheDocument();

    await user.unhover(navbar);
    expect(screen.queryByPlaceholderText("Search")).not.toBeInTheDocument();
  });

  it("expands on hover while collapsed, and folds back on leave", async () => {
    const user = userEvent.setup();
    setup();
    await collapseAndStepAway(user);
    expect(screen.queryByPlaceholderText("Search")).not.toBeInTheDocument();

    await user.hover(screen.getByLabelText("Main navigation"));
    expect(await screen.findByPlaceholderText("Search")).toBeInTheDocument();
    expect(screen.getByLabelText("Expand sidebar")).toBeInTheDocument();

    await user.unhover(screen.getByLabelText("Main navigation"));
    expect(screen.queryByPlaceholderText("Search")).not.toBeInTheDocument();
  });

  it("still navigates from a link clicked while hovering the collapsed rail", async () => {
    const user = userEvent.setup();
    const { onNavigate } = setup();
    await collapseAndStepAway(user);
    await user.hover(screen.getByLabelText("Main navigation"));
    await screen.findByPlaceholderText("Search");
    await user.click(screen.getByText("Dashboard"));
    expect(onNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("folds back after a link is clicked and the pointer leaves", async () => {
    const user = userEvent.setup();
    setup();
    await collapseAndStepAway(user);
    const navbar = screen.getByLabelText("Main navigation");

    await user.hover(navbar);
    await screen.findByPlaceholderText("Search");
    await user.click(screen.getByText("Dashboard"));
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();

    await user.unhover(navbar);
    expect(screen.queryByPlaceholderText("Search")).not.toBeInTheDocument();
  });

  it("ignores a cursor that only brushes past the collapsed rail", async () => {
    const user = userEvent.setup();
    setup();
    await collapseAndStepAway(user);
    const navbar = screen.getByLabelText("Main navigation");

    await user.hover(navbar);
    await user.unhover(navbar);
    await new Promise((resolve) => {
      setTimeout(resolve, 250);
    });

    expect(screen.queryByPlaceholderText("Search")).not.toBeInTheDocument();
  });

  it("collapses on its own where the screen is short of room", () => {
    matchWidth(1512);
    setup();
    expect(screen.getByLabelText("Expand sidebar")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Search")).not.toBeInTheDocument();
  });

  it("stays expanded on its own where there is room", () => {
    matchWidth(1920);
    setup();
    expect(screen.getByLabelText("Collapse sidebar")).toBeInTheDocument();
  });

  it("lets a manual choice override the automatic collapse", async () => {
    matchWidth(1512);
    setup();
    await userEvent.click(screen.getByLabelText("Expand sidebar"));
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
    expect(screen.getByLabelText("Collapse sidebar")).toBeInTheDocument();
  });

  it("never collapses to a rail on a phone, where the navbar is a drawer", () => {
    matchWidth(320);
    setup();
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
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
