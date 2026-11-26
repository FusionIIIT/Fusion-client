import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, within } from "@testing-library/react";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CategoryCountReport from "./CategoryCountReport";
import { databaseCategoryWiseStudentCountRoute } from "../../../routes/academicRoutes";
import { theme } from "../../../ui/theme/theme";

vi.mock("axios", () => ({ default: { get: vi.fn() } }));
vi.mock("@mantine/notifications", () => ({ showNotification: vi.fn() }));

const FILTERS = {
  batches: [2025, 2023],
  semesters: [1, 2],
  programme_categories: ["UG", "PG"],
  discipline_batches: [
    { id: 99, year: 2025, label: "B.Tech CSE", category: "UG" },
    { id: 100, year: 2025, label: "B.Tech ECE", category: "UG" },
    { id: 7, year: 2023, label: "B.Tech CSE", category: "UG" },
  ],
};

const count = (discipline, gen, ews, obc, sc, st, pwd, other = 0) => ({
  discipline,
  gen,
  ews,
  obc,
  sc,
  st,
  other,
  total: gen + ews + obc + sc + st + other,
  pwd,
});

const DATA = {
  rows: [
    count("B.Tech CSE", 95, 50, 80, 44, 21, 10),
    count("B.Tech ECE", 50, 20, 40, 20, 9, 5),
  ],
  students: 429,
  no_gender: 3,
};

function choose(label, option) {
  fireEvent.click(screen.getByRole("textbox", { name: label }));
  fireEvent.click(screen.getByRole("option", { name: option }));
}

const cells = (tr) =>
  within(tr)
    .getAllByRole("cell")
    .map((td) => td.textContent);

describe("CategoryCountReport", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "token"),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    Element.prototype.scrollIntoView = vi.fn();
    axios.get.mockReset();
    axios.get.mockResolvedValue({ data: DATA });
    render(
      <MantineProvider theme={theme}>
        <CategoryCountReport filters={FILTERS} />
      </MantineProvider>,
    );
  });

  it("counts each discipline by category with a total row", async () => {
    choose("Batch", "2025");
    fireEvent.click(screen.getByRole("button", { name: "Fetch" }));

    expect(await screen.findByText("B.Tech ECE")).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(
      databaseCategoryWiseStudentCountRoute,
      {
        params: { batch: "2025" },
        headers: { Authorization: "Token token" },
      },
    );
    const table = screen.getByRole("table");
    expect(
      within(table)
        .getAllByRole("columnheader")
        .map((th) => th.textContent),
    ).toEqual([
      "S. No.",
      "Discipline",
      "General",
      "EWS",
      "OBC",
      "SC",
      "ST",
      "Total",
      "PwD",
    ]);
    const [, cse, ece, total] = within(table).getAllByRole("row");
    expect(cells(cse)).toEqual([
      "1",
      "B.Tech CSE",
      "95",
      "50",
      "80",
      "44",
      "21",
      "290",
      "10",
    ]);
    expect(cells(ece)).toEqual([
      "2",
      "B.Tech ECE",
      "50",
      "20",
      "40",
      "20",
      "9",
      "139",
      "5",
    ]);
    expect(cells(total)).toEqual([
      "",
      "Total",
      "145",
      "70",
      "120",
      "64",
      "30",
      "429",
      "15",
    ]);
    expect(screen.getByText("429 students")).toBeInTheDocument();
    // No gender chosen: nothing to warn about.
    expect(screen.queryByText(/no gender recorded/)).not.toBeInTheDocument();
  });

  it("totals only the rows a search leaves, and keeps the total row last when sorted", async () => {
    choose("Batch", "2025");
    fireEvent.click(screen.getByRole("button", { name: "Fetch" }));
    expect(await screen.findByText("B.Tech ECE")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Total" }));
    let rows = within(screen.getByRole("table")).getAllByRole("row");
    expect(rows.slice(1).map((tr) => cells(tr)[1])).toEqual([
      "B.Tech ECE",
      "B.Tech CSE",
      "Total",
    ]);

    fireEvent.change(screen.getByPlaceholderText("Search these rows"), {
      target: { value: "ECE" },
    });
    rows = within(screen.getByRole("table")).getAllByRole("row");
    expect(cells(rows[rows.length - 1])).toEqual([
      "",
      "Total",
      "50",
      "20",
      "40",
      "20",
      "9",
      "139",
      "5",
    ]);
  });

  it("filters by gender and says how many have none recorded", async () => {
    choose("Batch", "2023");
    choose("Discipline (optional)", "B.Tech CSE");
    choose("Gender (optional)", "Female");
    fireEvent.click(screen.getByRole("button", { name: "Fetch" }));

    expect(await screen.findByText("B.Tech ECE")).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(
      databaseCategoryWiseStudentCountRoute,
      {
        params: { batch: "2023", batch_id: "7", gender: "F" },
        headers: { Authorization: "Token token" },
      },
    );
    expect(screen.getByText("429 students (Female)")).toBeInTheDocument();
    expect(
      screen.getByText("3 with no gender recorded, not counted"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Gender is recorded reliably from the 2025 batch"),
    ).toBeInTheDocument();
  });

  it("adds an Other column only when some student has another category", async () => {
    axios.get.mockResolvedValueOnce({
      data: {
        rows: [count("B.Tech CSE", 1, 0, 0, 0, 0, 0, 2)],
        students: 3,
        no_gender: 0,
      },
    });
    choose("Batch", "2025");
    fireEvent.click(screen.getByRole("button", { name: "Fetch" }));
    expect(await screen.findByText("B.Tech CSE")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Other" })).toBeInTheDocument();
  });
});
