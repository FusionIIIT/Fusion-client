import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import { ModuleRoutes } from "./ModuleRoutes";
import moduleReducer from "../../redux/moduleslice";
import { theme } from "../theme/theme";

const PAGES = [
  { key: "reg", slug: "registered-courses", title: "Registered Courses" },
  { key: "avail", slug: "available-courses", title: "Available Courses" },
];

const COMPONENTS = {
  reg: function Reg() {
    return <div>registered body</div>;
  },
  avail: function Avail() {
    return <div>available body</div>;
  },
};

function Probe() {
  const { pathname } = useLocation();
  return <div data-testid="pathname">{pathname}</div>;
}

function renderAt(path, pages = PAGES) {
  const store = configureStore({ reducer: { module: moduleReducer } });
  render(
    <Provider store={store}>
      <MantineProvider theme={theme}>
        <MemoryRouter initialEntries={[path]}>
          <Probe />
          <Routes>
            <Route
              path="/academics/*"
              element={
                <ModuleRoutes
                  pages={pages}
                  components={COMPONENTS}
                  basePath="/academics"
                  emptyMessage="No academic pages apply to your role."
                />
              }
            />
          </Routes>
        </MemoryRouter>
      </MantineProvider>
    </Provider>,
  );
  return () => screen.getByTestId("pathname").textContent;
}

describe("ModuleRoutes", () => {
  it("renders the page matching the slug", () => {
    renderAt("/academics/available-courses");
    expect(screen.getByText("available body")).toBeInTheDocument();
  });

  it("sends the module index to the first page", () => {
    const pathname = renderAt("/academics");
    expect(pathname()).toBe("/academics/registered-courses");
  });

  it("redirects an unknown slug to the first page without appending", () => {
    const pathname = renderAt("/academics/allocate-courses");
    expect(pathname()).toBe("/academics/registered-courses");
  });

  it("does not append when the unknown slug is itself the fallback name", () => {
    const pathname = renderAt(
      "/academics/registered-courses/registered-courses",
    );
    expect(pathname()).toBe("/academics/registered-courses");
  });

  it("collapses a deeply repeated path in a single hop", () => {
    const pathname = renderAt(
      `/academics/allocate-courses${"/registered-courses".repeat(40)}`,
    );
    expect(pathname()).toBe("/academics/registered-courses");
  });

  it("renders the empty message when the role has no pages", () => {
    renderAt("/academics", []);
    expect(
      screen.getByText("No academic pages apply to your role."),
    ).toBeInTheDocument();
  });

  it("gates a page flagged desktopOnly when the viewport is narrow", () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
    renderAt("/academics/registered-courses", [
      { ...PAGES[0], desktopOnly: true },
      PAGES[1],
    ]);
    expect(screen.queryByText("registered body")).not.toBeInTheDocument();
    expect(
      screen.getByText(/Open this on a larger screen/),
    ).toBeInTheDocument();
  });

  it("leaves an unflagged page alone on the same narrow viewport", () => {
    renderAt("/academics/available-courses");
    expect(screen.getByText("available body")).toBeInTheDocument();
  });
});
