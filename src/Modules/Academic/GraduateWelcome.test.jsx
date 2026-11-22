import { MantineProvider } from "@mantine/core";
import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import GraduateWelcome from "./GraduateWelcome";
import userReducer, {
  setRollNo,
  setStudentInfo,
  setStudentStatus,
  setUserName,
} from "../../redux/userslice";
import { theme } from "../../ui/theme/theme";

function show({
  name = "ASHA RAO",
  info = { discipline: "B.Tech CSE", batch: 2021 },
} = {}) {
  const store = configureStore({ reducer: { user: userReducer } });
  store.dispatch(setUserName(name));
  store.dispatch(setRollNo("21BCS001"));
  store.dispatch(setStudentStatus("ALUMNI"));
  store.dispatch(setStudentInfo(info));
  render(
    <Provider store={store}>
      <MantineProvider theme={theme}>
        <MemoryRouter>
          <GraduateWelcome />
        </MemoryRouter>
      </MantineProvider>
    </Provider>,
  );
}

describe("GraduateWelcome", () => {
  it("congratulates the graduate by name, in title case", () => {
    show();
    expect(
      screen.getByRole("heading", { name: "Congratulations, Asha Rao" }),
    ).toBeInTheDocument();
  });

  it("names the institute they graduated from", () => {
    show();
    expect(
      screen.getByText(
        "on graduating from PDPM Indian Institute of Information Technology, Design and Manufacturing, Jabalpur",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "PDPM IIITDM Jabalpur crest" }),
    ).toBeInTheDocument();
  });

  it("shows the programme, batch and roll number", () => {
    show();
    expect(screen.getByText("B.Tech CSE")).toBeInTheDocument();
    expect(screen.getByText("2021")).toBeInTheDocument();
    expect(screen.getByText("21BCS001")).toBeInTheDocument();
  });

  it("leaves out programme and batch when they are not known", () => {
    show({ info: null });
    expect(screen.queryByText("Programme")).not.toBeInTheDocument();
    expect(screen.queryByText("Batch")).not.toBeInTheDocument();
    expect(screen.getByText("21BCS001")).toBeInTheDocument();
  });

  it("keeps the links to courses and results", () => {
    show();
    expect(
      screen.getByRole("link", { name: "Registered Courses" }),
    ).toHaveAttribute("href", "/academics/registered-courses");
    expect(screen.getByRole("link", { name: "Results" })).toHaveAttribute(
      "href",
      "/examination/result",
    );
  });

  it("keeps hyphenated and apostrophe names readable", () => {
    show({ name: "MARY-ANN D'SOUZA" });
    expect(
      screen.getByRole("heading", {
        name: "Congratulations, Mary-Ann D'Souza",
      }),
    ).toBeInTheDocument();
  });
});
