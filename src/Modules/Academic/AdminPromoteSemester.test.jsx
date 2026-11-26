import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, within } from "@testing-library/react";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminPromoteSemester from "./AdminPromoteSemester";
import {
  listBatchesRoute,
  listStudentsPromoteRoute,
} from "../../routes/academicRoutes";
import { theme } from "../../ui/theme/theme";

vi.mock("axios", () => ({ default: { get: vi.fn(), post: vi.fn() } }));

const STUDENTS = [
  {
    id: "21BCS001",
    username: "21BCS001",
    name: "Asha Rao",
    discipline: "CSE",
    current_semester_no: 8,
    status: "ALUMNI",
  },
  {
    id: "21BCS002",
    username: "21BCS002",
    name: "Ravi Kumar",
    discipline: "CSE",
    current_semester_no: 7,
    status: "PRESENT",
  },
];

const rowOf = (roll) => screen.getByText(roll).closest("tr");

describe("AdminPromoteSemester", () => {
  beforeEach(async () => {
    vi.stubGlobal("localStorage", { getItem: vi.fn(() => "token") });
    Element.prototype.scrollIntoView = vi.fn();
    axios.get.mockReset();
    axios.get.mockImplementation((url) =>
      Promise.resolve({
        data:
          url === listBatchesRoute
            ? [{ id: 1, year: 2021, label: "B.Tech CSE 2021" }]
            : url === listStudentsPromoteRoute
              ? STUDENTS
              : [],
      }),
    );
    render(
      <MantineProvider theme={theme}>
        <AdminPromoteSemester />
      </MantineProvider>,
    );
    fireEvent.click(
      await screen.findByRole("textbox", { name: "Select Batch" }),
    );
    fireEvent.click(
      await screen.findByRole("option", { name: "B.Tech CSE 2021" }),
    );
    await screen.findByText("21BCS001");
  });

  it("marks an alumnus and does not let them be selected", () => {
    expect(within(rowOf("21BCS001")).getByText("Alumni")).toBeInTheDocument();
    expect(within(rowOf("21BCS001")).getByRole("checkbox")).toBeDisabled();
    expect(within(rowOf("21BCS002")).queryByText("Alumni")).toBeNull();
  });

  it("selects every student but the alumni", () => {
    fireEvent.click(screen.getByRole("button", { name: "Select All" }));
    expect(within(rowOf("21BCS001")).getByRole("checkbox")).not.toBeChecked();
    expect(within(rowOf("21BCS002")).getByRole("checkbox")).toBeChecked();
  });
});
