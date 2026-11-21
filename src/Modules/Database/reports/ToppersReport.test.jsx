import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, within } from "@testing-library/react";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ToppersReport, { rankToppers } from "./ToppersReport";
import { databaseSpiCpiRoute } from "../../../routes/academicRoutes";
import { theme } from "../../../ui/theme/theme";

vi.mock("axios", () => ({ default: { get: vi.fn() } }));
vi.mock("@mantine/notifications", () => ({ showNotification: vi.fn() }));

const FILTERS = {
  batches: [2024],
  semesters: [1, 2, 3, 4],
  programme_categories: ["UG", "PG"],
  discipline_batches: [
    { id: 99, year: 2024, label: "B.Tech CSE", category: "UG" },
    { id: 100, year: 2024, label: "B.Tech ECE", category: "UG" },
  ],
};

const row = (roll, discipline, cpi, spi = cpi) => ({
  roll_no: roll,
  student_name: `Name ${roll}`,
  discipline,
  semester: 4,
  spi,
  cpi,
  tu: 80,
  tp: 600,
});

const ROWS = [
  row("24BCS001", "B.Tech CSE", 8.0, 9.5),
  row("24BCS002", "B.Tech CSE", 9.1, 7.0),
  row("24BCS003", "B.Tech CSE", 8.0, 8.0),
  row("24BCS004", "B.Tech CSE", 7.2, 9.9),
  row("24BCS005", "B.Tech CSE", null, null),
  row("24BEC001", "B.Tech ECE", 9.5, 6.0),
  row("24BEC002", "B.Tech ECE", 6.1, 8.8),
];

const pick = (rows) => rows.map((r) => [r.roll_no, r.rank]);

describe("rankToppers", () => {
  it("ranks each discipline by CPI, best first, leaving out students without grades", () => {
    expect(
      pick(rankToppers(ROWS, { by: "cpi", top: 5, within: "discipline" })),
    ).toEqual([
      ["24BCS002", 1],
      ["24BCS001", 2],
      ["24BCS003", 2],
      ["24BCS004", 4],
      ["24BEC001", 1],
      ["24BEC002", 2],
    ]);
  });

  it("keeps everyone tied at the last place", () => {
    // Top 2 of CSE: 9.1, then 8.0 twice, so three students.
    expect(
      pick(rankToppers(ROWS, { by: "cpi", top: 2, within: "discipline" })),
    ).toEqual([
      ["24BCS002", 1],
      ["24BCS001", 2],
      ["24BCS003", 2],
      ["24BEC001", 1],
      ["24BEC002", 2],
    ]);
    expect(
      pick(rankToppers(ROWS, { by: "cpi", top: 1, within: "discipline" })),
    ).toEqual([
      ["24BCS002", 1],
      ["24BEC001", 1],
    ]);
  });

  it("ranks across the whole selection, or by SPI", () => {
    expect(
      pick(rankToppers(ROWS, { by: "cpi", top: 2, within: "all" })),
    ).toEqual([
      ["24BEC001", 1],
      ["24BCS002", 2],
    ]);
    expect(
      pick(rankToppers(ROWS, { by: "spi", top: 3, within: "all" })),
    ).toEqual([
      ["24BCS004", 1],
      ["24BCS001", 2],
      ["24BEC002", 3],
    ]);
  });
});

function choose(label, option) {
  fireEvent.click(screen.getByRole("textbox", { name: label }));
  fireEvent.click(screen.getByRole("option", { name: option }));
}

const tableRows = () =>
  within(screen.getByRole("table"))
    .getAllByRole("row")
    .slice(1)
    .map((tr) =>
      within(tr)
        .getAllByRole("cell")
        .map((td) => td.textContent),
    );

describe("ToppersReport", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "token"),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    Element.prototype.scrollIntoView = vi.fn();
    axios.get.mockReset();
    axios.get.mockResolvedValue({
      data: { count: 7, students: 7, with_grades: 6, rows: ROWS },
    });
    render(
      <MantineProvider theme={theme}>
        <ToppersReport filters={FILTERS} />
      </MantineProvider>,
    );
  });

  it("shows the top students of each discipline with their SPI, CPI, TU and TP", async () => {
    choose("Batch", "2024");
    // Top 10 is the default.
    fireEvent.click(screen.getByRole("button", { name: "Fetch" }));

    expect(await screen.findByText("Name 24BCS002")).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(databaseSpiCpiRoute, {
      params: { batch: "2024" },
      headers: { Authorization: "Token token" },
    });
    expect(tableRows()[0]).toEqual([
      "1",
      "1",
      "24BCS002",
      "Name 24BCS002",
      "B.Tech CSE",
      "4",
      "7.0",
      "9.1",
      "80",
      "600",
    ]);
    // Each discipline best first; the student without grades is left out.
    expect(tableRows().map((r) => [r[1], r[2]])).toEqual([
      ["1", "24BCS002"],
      ["2", "24BCS001"],
      ["2", "24BCS003"],
      ["4", "24BCS004"],
      ["1", "24BEC001"],
      ["2", "24BEC002"],
    ]);
    expect(
      screen.getByText("Top 10 by CPI in each discipline"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Ties share a rank")).not.toBeInTheDocument();
  });

  it("passes the semester and discipline on and ranks by SPI across the selection", async () => {
    choose("Batch", "2024");
    choose("Discipline (optional)", "B.Tech CSE");
    choose("Semester (optional)", "4");
    choose("Show", "Top 5");
    choose("Rank by", "SPI");
    choose("Rank within", "Whole selection");
    fireEvent.click(screen.getByRole("button", { name: "Fetch" }));

    expect(await screen.findByText("Name 24BCS004")).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(databaseSpiCpiRoute, {
      params: { batch: "2024", batch_id: "99", semester: "4" },
      headers: { Authorization: "Token token" },
    });
    // A chosen semester drops the semester column, as on SPI and CPI.
    expect(tableRows()[0]).toEqual([
      "1",
      "1",
      "24BCS004",
      "Name 24BCS004",
      "B.Tech CSE",
      "9.9",
      "7.2",
      "80",
      "600",
    ]);
    expect(
      screen.getByText("Top 5 by SPI across the selection"),
    ).toBeInTheDocument();
  });

  it("says so when a tie makes a list longer than asked for", async () => {
    // Six CSE students, the fifth and sixth tied at 7.0.
    const cpis = [9.0, 8.5, 8.0, 7.5, 7.0, 7.0, 6.0];
    axios.get.mockResolvedValueOnce({
      data: {
        count: 7,
        students: 7,
        with_grades: 7,
        rows: cpis.map((cpi, i) => row(`24BCS10${i}`, "B.Tech CSE", cpi)),
      },
    });
    choose("Batch", "2024");
    choose("Show", "Top 5");
    fireEvent.click(screen.getByRole("button", { name: "Fetch" }));

    expect(await screen.findByText("Name 24BCS100")).toBeInTheDocument();
    expect(tableRows().map((r) => [r[1], r[2]])).toEqual([
      ["1", "24BCS100"],
      ["2", "24BCS101"],
      ["3", "24BCS102"],
      ["4", "24BCS103"],
      ["5", "24BCS104"],
      ["5", "24BCS105"],
    ]);
    expect(screen.getByText("Ties share a rank")).toBeInTheDocument();
  });
});
