import { act, render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import { notifications } from "@mantine/notifications";
import { afterEach, describe, expect, it, vi } from "vitest";

import useLogout from "./useLogout";
import { RELOADED_KEY } from "./useReloadOnNewBuild";
import userReducer from "../redux/userslice";

vi.mock("axios", () => ({
  default: { post: vi.fn().mockResolvedValue({ data: {} }) },
}));

function LogoutButton() {
  const { handleLogout } = useLogout();
  return <button onClick={() => handleLogout()}>log out</button>;
}

afterEach(() => {
  notifications.clean();
  sessionStorage.clear();
  localStorage.clear();
});

describe("useLogout", () => {
  it("clears the session but keeps the tab's new-build reload guard", async () => {
    const guard = JSON.stringify({ from: "a", to: "b", at: Date.now() });
    sessionStorage.setItem(RELOADED_KEY, guard);
    sessionStorage.setItem("authToken", "t");
    localStorage.setItem("authToken", "t");
    render(
      <Provider store={configureStore({ reducer: { user: userReducer } })}>
        <MemoryRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <LogoutButton />
        </MemoryRouter>
      </Provider>,
    );

    await act(async () => {
      screen.getByText("log out").click();
    });

    expect(sessionStorage.getItem("authToken")).toBeNull();
    expect(localStorage.getItem("authToken")).toBeNull();
    expect(sessionStorage.getItem(RELOADED_KEY)).toBe(guard);
  });
});
