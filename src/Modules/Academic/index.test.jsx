import { MantineProvider } from "@mantine/core";
import { act, render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import AcademicPage from "./index";
import userReducer, { setProgrammeType, setRole } from "../../redux/userslice";
import moduleReducer from "../../redux/moduleslice";
import { theme } from "../../ui/theme/theme";

// The pages themselves load data; only the routing is under test here.
vi.mock("axios", () => {
  const pending = () => new Promise(() => {});
  const client = { get: pending, post: pending, put: pending, delete: pending };
  return { default: { ...client, create: () => client } };
});

function Probe() {
  const location = useLocation();
  return <div data-testid="address">{location.pathname + location.search}</div>;
}

function renderAt(path, role = "student") {
  const store = configureStore({
    reducer: { user: userReducer, module: moduleReducer },
  });
  store.dispatch(setRole(role));
  render(
    <Provider store={store}>
      <MantineProvider theme={theme}>
        <MemoryRouter
          initialEntries={[path]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Probe />
          <Routes>
            <Route path="/academics/*" element={<AcademicPage />} />
          </Routes>
        </MemoryRouter>
      </MantineProvider>
    </Provider>,
  );
  return {
    address: () => screen.getByTestId("address").textContent,
    programmeLoads: (type) => act(() => store.dispatch(setProgrammeType(type))),
  };
}

describe("AcademicPage on a fresh load", () => {
  it.each([
    [
      "a PG page address",
      "/academics/thesis-course-registration",
      "/academics/thesis-course-registration",
    ],
    [
      "a PhD registration notification",
      "/academics?tab=PhD%20Course%20Registration",
      "/academics/thesis-course-registration",
    ],
  ])(
    "keeps %s until the student's programme has loaded",
    async (_, path, expected) => {
      const { address, programmeLoads } = renderAt(path);
      expect(address()).toBe(path);

      await programmeLoads("PHD");
      await waitFor(() => expect(address()).toBe(expected));
    },
  );

  it("doesn't hold staff, who have no programme, behind the loader", async () => {
    const { address } = renderAt("/academics/no-such-page", "acadadmin");

    await waitFor(() => expect(address()).not.toBe("/academics/no-such-page"));
  });

  it("still sends a UG student off a PG-only address", async () => {
    const { address, programmeLoads } = renderAt(
      "/academics/thesis-course-registration",
    );

    await programmeLoads("UG");
    await waitFor(() =>
      expect(address()).not.toBe("/academics/thesis-course-registration"),
    );
  });
});
