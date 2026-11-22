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
  programme_categories: ["UG", "PG", "PHD"],
  discipline_batches: [
    { id: 99, year: 2024, label: "B.Tech CSE", category: "UG" },
    { id: 100, year: 2024, label: "B.Tech ECE", category: "UG" },
    { id: 101, year: 2024, label: "M.Tech CSE", category: "PG" },
    { id: 7, year: 2023, label: "B.Tech CSE", category: "UG" },
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
    tu: 148,
    tp: 1000.3,
  },
  {
    roll_no: "24BCS001",
    student_name: "First Student",
    discipline: "B.Tech CSE",
    semester: 4,
    spi: 7.5,
    cpi: 8,
    tu: 80,
    tp: 640,
  },
  {
    roll_no: "24BEC001",
    student_name: "Second Student",
    discipline: "B.Tech ECE",
    semester: null,
    spi: null,
    cpi: null,
    tu: null,
    tp: null,
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
      "TU",
      "TP",
    ]);
    const first = screen.getByText("24BCS001").closest("tr");
    expect(within(first).getByText("7.5")).toBeInTheDocument();
    expect(within(first).getByText("8.0")).toBeInTheDocument();
    expect(within(first).getByText("80")).toBeInTheDocument();
    expect(within(first).getByText("640")).toBeInTheDocument();
    const summer = screen.getByText("24BCS003").closest("tr");
    expect(within(summer).getByText("Summer 2")).toBeInTheDocument();
    expect(within(summer).getByText("9.0")).toBeInTheDocument();
    expect(within(summer).getByText("148")).toBeInTheDocument();
    expect(within(summer).getByText("1000.3")).toBeInTheDocument();
    const second = screen.getByText("24BEC001").closest("tr");
    expect(within(second).getAllByText("-")).toHaveLength(5);
  });

  it("keeps the discipline column and drops the semester column once both are chosen", async () => {
    choose("Batch", "2024");
    choose("Discipline (optional)", "B.Tech ECE");
    choose("Semester (optional)", "4");
    fireEvent.click(screen.getByRole("button", { name: "Fetch" }));

    expect(await screen.findByText("First Student")).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(databaseSpiCpiRoute, {
      params: { batch: "2024", batch_id: "100", semester: "4" },
      headers: { Authorization: "Token token" },
    });
    const fixed = [
      "S. No.",
      "Roll No",
      "Name",
      "Discipline",
      "SPI",
      "CPI",
      "TU",
      "TP",
    ];
    expect(headers()).toEqual(fixed);

    // Changing the filters after fetching leaves the shown report as fetched.
    choose("Batch", "2023");
    expect(headers()).toEqual(fixed);
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

  it("narrows to a programme and offers only its disciplines", async () => {
    choose("Batch", "2024");
    choose("Discipline (optional)", "B.Tech ECE");
    // A discipline of another programme is cleared when the programme changes.
    choose("Programme (optional)", "PG");
    const discipline = screen.getByRole("textbox", {
      name: "Discipline (optional)",
    });
    expect(discipline).toHaveValue("");
    fireEvent.click(discipline);
    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toEqual(["M.Tech CSE"]);
    fireEvent.click(screen.getByRole("option", { name: "M.Tech CSE" }));

    fireEvent.click(screen.getByRole("button", { name: "Fetch" }));
    expect(await screen.findByText("First Student")).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(databaseSpiCpiRoute, {
      params: { batch: "2024", programme_type: "PG", batch_id: "101" },
      headers: { Authorization: "Token token" },
    });
  });

  it("offers UG, PG and PhD as programmes", () => {
    fireEvent.click(
      screen.getByRole("textbox", { name: "Programme (optional)" }),
    );
    expect(
      screen.getAllByRole("option").map((option) => option.textContent),
    ).toEqual(["UG", "PG", "PhD"]);
  });

  it("adds a Status column only when the batch has alumni", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        count: 2,
        students: 2,
        with_grades: 2,
        rows: [
          { ...ROWS[1], status: "Present" },
          { ...ROWS[0], roll_no: "24BCS009", status: "Alumni" },
        ],
      },
    });
    choose("Batch", "2024");
    fireEvent.click(screen.getByRole("button", { name: "Fetch" }));
    expect(await screen.findByText("24BCS009")).toBeInTheDocument();
    expect(headers().slice(1, 5)).toEqual([
      "Roll No",
      "Name",
      "Discipline",
      "Status",
    ]);
    expect(screen.getByText("Alumni")).toBeInTheDocument();
  });
});
