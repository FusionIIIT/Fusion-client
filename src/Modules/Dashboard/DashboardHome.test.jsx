import { MantineProvider } from "@mantine/core";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import DashboardHome from "./DashboardHome";
import userReducer, {
  setRole,
  setStudentStatus,
  setUserName,
} from "../../redux/userslice";
import { theme } from "../../ui/theme/theme";

vi.mock("./StudentCreditSummary", () => ({
  default: () => <p>credit summary</p>,
}));

function show(status) {
  const store = configureStore({ reducer: { user: userReducer } });
  store.dispatch(setUserName("Asha Rao"));
  store.dispatch(setRole("student"));
  store.dispatch(setStudentStatus(status));
  render(
    <Provider store={store}>
      <MantineProvider theme={theme}>
        <MemoryRouter>
          <DashboardHome />
        </MemoryRouter>
      </MantineProvider>
    </Provider>,
  );
}

const READ_ONLY =
  "Your account is read-only. You can view your registered courses and results.";

describe("DashboardHome for a student", () => {
  it("congratulates an alumnus and leaves out the credit summary", () => {
    show("ALUMNI");
    expect(
      screen.getByRole("heading", { name: "Congratulations, Asha Rao" }),
    ).toBeInTheDocument();
    expect(screen.queryByText("credit summary")).not.toBeInTheDocument();
  });

  it("shows a withdrawn student the read-only card and their credits", () => {
    show("WITHDRAWN");
    expect(screen.getByText(READ_ONLY)).toBeInTheDocument();
    expect(screen.getByText("credit summary")).toBeInTheDocument();
    expect(screen.queryByText(/Congratulations/)).not.toBeInTheDocument();
  });

  it("shows a present student only their credit standing", () => {
    show("PRESENT");
    expect(screen.queryByText(READ_ONLY)).not.toBeInTheDocument();
    expect(screen.getByText("credit summary")).toBeInTheDocument();
  });
});
