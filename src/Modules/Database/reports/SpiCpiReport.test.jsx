import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, within } from "@testing-library/react";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import SpiCpiReport from "./SpiCpiReport";
import { databaseSpiCpiRoute } from "../../../routes/academicRoutes";
import { theme } from "../../../ui/theme/theme";

vi.mock("axios", () => ({ default: { get: vi.fn() } }));
vi.mock("@mantine/notifications", () => ({ showNotification: vi.fn() }));

const FILTERS = {
  batches: [2024, 2023],
  semesters: [1, 2, 3, 4],
  discipline_batches: [
    { id: 99, year: 2024, label: "B.Tech CSE" },
    { id: 100, year: 2024, label: "B.Tech ECE" },
    { id: 7, year: 2023, label: "B.Tech CSE" },
  ],
};

const ROWS = [
  {
    roll_no: "24BCS003",
    student_name: "Summer Student",
    discipline: "B.Tech CSE",
    semester: "Summer 2",
    spi: 9,
    cpi: 6.25,
  },
  {
    roll_no: "24BCS001",
    student_name: "First Student",
    discipline: "B.Tech CSE",
    semester: 4,
    spi: 7.5,
    cpi: 8,
  },
  {
    roll_no: "24BEC001",
    student_name: "Second Student",
    discipline: "B.Tech ECE",
    semester: null,
    spi: null,
    cpi: null,
  },
];

function choose(label, option) {
  fireEvent.click(screen.getByRole("textbox", { name: label }));
  fireEvent.click(screen.getByRole("option", { name: option }));
}

const headers = () =>
  within(screen.getByRole("table"))
    .getAllByRole("columnheader")
    .map((th) => th.textContent);

describe("SpiCpiReport", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "token"),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    // jsdom has no scrollIntoView, which the Select dropdown calls.
    Element.prototype.scrollIntoView = vi.fn();
    axios.get.mockReset();
    axios.get.mockResolvedValue({
      data: { count: 3, students: 3, with_grades: 2, rows: ROWS },
    });
    render(
      <MantineProvider theme={theme}>
        <SpiCpiReport filters={FILTERS} />
      </MantineProvider>,
    );
  });

  it("lists every discipline at its latest semester when only a batch is chosen", async () => {
    choose("Batch", "2024");
    fireEvent.click(screen.getByRole("button", { name: "Fetch" }));

    expect(await screen.findByText("First Student")).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(databaseSpiCpiRoute, {
      params: { batch: "2024" },
      headers: { Authorization: "Token token" },
    });
    expect(headers()).toEqual([
      "S. No.",
      "Roll No",
      "Name",
      "Discipline",
      "Semester",
      "SPI",
      "CPI",
    ]);
    const first = screen.getByText("24BCS001").closest("tr");
    expect(within(first).getByText("7.5")).toBeInTheDocument();
    expect(within(first).getByText("8.0")).toBeInTheDocument();
    const summer = screen.getByText("24BCS003").closest("tr");
    expect(within(summer).getByText("Summer 2")).toBeInTheDocument();
    expect(within(summer).getByText("9.0")).toBeInTheDocument();
    const second = screen.getByText("24BEC001").closest("tr");
    expect(within(second).getAllByText("-")).toHaveLength(3);
  });

  it("drops the discipline and semester columns once both are chosen", async () => {
    choose("Batch", "2024");
    choose("Discipline (optional)", "B.Tech ECE");
    choose("Semester (optional)", "4");
    fireEvent.click(screen.getByRole("button", { name: "Fetch" }));

    expect(await screen.findByText("First Student")).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(databaseSpiCpiRoute, {
      params: { batch: "2024", batch_id: "100", semester: "4" },
      headers: { Authorization: "Token token" },
    });
    expect(headers()).toEqual(["S. No.", "Roll No", "Name", "SPI", "CPI"]);

    // Changing the filters after fetching leaves the shown report as fetched.
    choose("Batch", "2023");
    expect(headers()).toEqual(["S. No.", "Roll No", "Name", "SPI", "CPI"]);
    expect(screen.getByText("Semester 4")).toBeInTheDocument();
  });

  it("offers only the chosen batch's disciplines", () => {
    choose("Batch", "2023");
    fireEvent.click(
      screen.getByRole("textbox", { name: "Discipline (optional)" }),
    );
    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toEqual(["B.Tech CSE"]);
  });
});
