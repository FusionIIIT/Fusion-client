import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import {
  ADMIN_ROLES,
  FACULTY_ROLES,
  ProtectedRoute,
  STUDENT_ROLES,
} from "./ProtectedRoute";

function renderAs(role, allowedRoles) {
  const user = createSlice({
    name: "user",
    initialState: { role },
    reducers: {},
  });
  const store = configureStore({ reducer: { user: user.reducer } });
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/programme_curriculum/page"]}>
        <Routes>
          <Route
            path="/programme_curriculum/page"
            element={
              <ProtectedRoute allowedRoles={allowedRoles}>
                <div>curriculum page</div>
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<div>dashboard</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
}

describe("ProtectedRoute", () => {
  it.each([
    "HOD (CSE)",
    "HOD (Design)",
    "HOD (Liberal Arts)",
    "HOD (MT)",
    "HOD (SM)",
    "HOD (LA)",
  ])("opens faculty pages for every HOD role: %s", (role) => {
    renderAs(role, FACULTY_ROLES);
    expect(screen.getByText("curriculum page")).toBeInTheDocument();
  });

  it.each([
    "Professor",
    "Assistant Professor",
    "Associate Professor",
    "Dean Academic",
  ])("opens faculty pages for %s", (role) => {
    renderAs(role, FACULTY_ROLES);
    expect(screen.getByText("curriculum page")).toBeInTheDocument();
  });

  it.each(["student", "acadadmin", "Director", "CSE Staff", "", undefined])(
    "sends %s from a faculty page to the dashboard",
    (role) => {
      renderAs(role, FACULTY_ROLES);
      expect(screen.getByText("dashboard")).toBeInTheDocument();
      expect(screen.queryByText("curriculum page")).not.toBeInTheDocument();
    },
  );

  it("does not let an HOD open admin or student pages", () => {
    renderAs("HOD (MT)", ADMIN_ROLES);
    expect(screen.getByText("dashboard")).toBeInTheDocument();
  });

  it("keeps admin pages for admins", () => {
    renderAs("acadadmin", ADMIN_ROLES);
    expect(screen.getByText("curriculum page")).toBeInTheDocument();
  });

  it("keeps student pages for students", () => {
    renderAs("student", STUDENT_ROLES);
    expect(screen.getByText("curriculum page")).toBeInTheDocument();
  });

  it("does not treat a role that merely contains HOD as an HOD role", () => {
    renderAs("Ex HOD (CSE)", FACULTY_ROLES);
    expect(screen.getByText("dashboard")).toBeInTheDocument();
  });
});
