import { MantineProvider } from "@mantine/core";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import AlumniHome from "./AlumniHome";
import userReducer, {
  setRollNo,
  setStudentInfo,
  setStudentStatus,
  setUserName,
} from "../../redux/userslice";
import { theme } from "../../ui/theme/theme";

function show(status) {
  const store = configureStore({ reducer: { user: userReducer } });
  store.dispatch(setUserName("Asha Rao"));
  store.dispatch(setRollNo("21BCS001"));
  store.dispatch(setStudentStatus(status));
  store.dispatch(setStudentInfo({ discipline: "B.Tech CSE", batch: 2021 }));
  render(
    <Provider store={store}>
      <MantineProvider theme={theme}>
        <MemoryRouter>
          <AlumniHome />
        </MemoryRouter>
      </MantineProvider>
    </Provider>,
  );
}

describe("AlumniHome", () => {
  it("tells an alumnus who they are and that the account is read-only", () => {
    show("ALUMNI");
    // The page title already says Alumni: the card leads with the name.
    expect(
      screen.getByRole("heading", { name: "Asha Rao" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Alumni")).toBeInTheDocument();
    expect(screen.getByText("21BCS001")).toBeInTheDocument();
    expect(screen.getByText("B.Tech CSE, batch 2021")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Your account is read-only. You can view your registered courses and results.",
      ),
    ).toBeInTheDocument();
  });

  it("links to the courses and results", () => {
    show("ALUMNI");
    expect(
      screen.getByRole("link", { name: "Registered Courses" }),
    ).toHaveAttribute("href", "/academics/registered-courses");
    expect(screen.getByRole("link", { name: "Results" })).toHaveAttribute(
      "href",
      "/examination/result",
    );
  });

  it("names a withdrawn student's status", () => {
    show("WITHDRAWN");
    expect(screen.getByText("Withdrawn")).toBeInTheDocument();
  });
});
