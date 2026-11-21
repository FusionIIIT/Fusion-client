import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ReportTable, { compareValues, sortRows } from "./ReportTable";
import { theme } from "../../ui/theme/theme";

const pointer = {
  format: (value) =>
    value === null || value === undefined ? "-" : value.toFixed(1),
};

const COLUMNS = [
  { key: "roll_no", label: "Roll No" },
  { key: "name", label: "Name" },
  { key: "semester", label: "Semester", format: (v) => v ?? "-" },
  { key: "cpi", label: "CPI", ...pointer },
  { key: "tu", label: "TU" },
];

const ROWS = [
  { roll_no: "24BCS010", name: "carol", semester: 4, cpi: 7.5, tu: "148" },
  {
    roll_no: "24BCS002",
    name: "Alice",
    semester: "Summer 2",
    cpi: 10,
    tu: "80",
  },
  { roll_no: "24BCS001", name: "bob", semester: null, cpi: null, tu: null },
  { roll_no: "24BCS003", name: "dave", semester: 2, cpi: 7.25, tu: "9" },
];

function renderTable(columns = COLUMNS) {
  const view = render(
    <MantineProvider theme={theme}>
      <ReportTable columns={columns} rows={ROWS} filename="report" />
    </MantineProvider>,
  );
  return view;
}

const header = (label) => screen.getByRole("button", { name: label });
const th = (label) => header(label).closest("th");

// The roll numbers down the table, and the serial numbers beside them.
const column = (index) =>
  within(screen.getByRole("table"))
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[index].textContent);
const rolls = () => column(1);

describe("ReportTable sorting", () => {
  it("shows rows in the order the report sent them until a header is clicked", () => {
    renderTable();
    expect(rolls()).toEqual(["24BCS010", "24BCS002", "24BCS001", "24BCS003"]);
    COLUMNS.forEach((c) =>
      expect(th(c.label)).toHaveAttribute("aria-sort", "none"),
    );
  });

  it("sorts every column: ascending, then descending, then back to the original order", () => {
    renderTable();

    fireEvent.click(header("Roll No"));
    expect(th("Roll No")).toHaveAttribute("aria-sort", "ascending");
    expect(rolls()).toEqual(["24BCS001", "24BCS002", "24BCS003", "24BCS010"]);
    expect(column(0)).toEqual(["1", "2", "3", "4"]);

    fireEvent.click(header("Roll No"));
    expect(th("Roll No")).toHaveAttribute("aria-sort", "descending");
    expect(rolls()).toEqual(["24BCS010", "24BCS003", "24BCS002", "24BCS001"]);

    fireEvent.click(header("Roll No"));
    expect(th("Roll No")).toHaveAttribute("aria-sort", "none");
    expect(rolls()).toEqual(["24BCS010", "24BCS002", "24BCS001", "24BCS003"]);
  });

  it("sorts numbers by value, not by the text on screen, with empty cells last", () => {
    renderTable();
    fireEvent.click(header("CPI"));
    // 7.25 < 7.5 < 10; "-" (no CPI) last.
    expect(rolls()).toEqual(["24BCS003", "24BCS010", "24BCS002", "24BCS001"]);
    fireEvent.click(header("CPI"));
    expect(rolls()).toEqual(["24BCS002", "24BCS010", "24BCS003", "24BCS001"]);

    // Numbers kept as text still sort as numbers: 9 < 80 < 148.
    fireEvent.click(header("TU"));
    expect(rolls()).toEqual(["24BCS003", "24BCS002", "24BCS010", "24BCS001"]);
  });

  it("sorts names without regard to case and puts semesters before summer terms", () => {
    renderTable();
    fireEvent.click(header("Name"));
    expect(column(2)).toEqual(["Alice", "bob", "carol", "dave"]);

    fireEvent.click(header("Semester"));
    expect(column(3)).toEqual(["2", "4", "Summer 2", "-"]);
    expect(th("Name")).toHaveAttribute("aria-sort", "none");
  });

  it("sorts only the rows a search leaves", () => {
    renderTable();
    fireEvent.change(screen.getByPlaceholderText("Search these rows"), {
      target: { value: "24BCS00" },
    });
    fireEvent.click(header("Roll No"));
    fireEvent.click(header("Roll No"));
    expect(rolls()).toEqual(["24BCS003", "24BCS002", "24BCS001"]);
    expect(column(0)).toEqual(["1", "2", "3"]);
  });

  it("drops a sort on a column the report no longer shows", () => {
    const view = renderTable();
    fireEvent.click(header("Semester"));
    view.rerender(
      <MantineProvider theme={theme}>
        <ReportTable
          columns={COLUMNS.filter((c) => c.key !== "semester")}
          rows={ROWS}
          filename="report"
        />
      </MantineProvider>,
    );
    expect(rolls()).toEqual(["24BCS010", "24BCS002", "24BCS001", "24BCS003"]);
  });
});

describe("compareValues and sortRows", () => {
  it("orders digit runs as numbers inside text", () => {
    expect(compareValues("Summer 2", "Summer 10")).toBeLessThan(0);
    expect(compareValues("CS2002", "CS10")).toBeGreaterThan(0);
    expect(compareValues("b", "A")).toBeGreaterThan(0);
    expect(compareValues("7.25", 7.5)).toBeLessThan(0);
  });

  it("keeps ties in their original order and does not change the input", () => {
    const rows = [
      { id: 1, v: 5 },
      { id: 2, v: "" },
      { id: 3, v: 5 },
      { id: 4, v: 1 },
      { id: 5, v: "-" },
    ];
    expect(sortRows(rows, "v", "asc").map((r) => r.id)).toEqual([
      4, 1, 3, 2, 5,
    ]);
    expect(sortRows(rows, "v", "desc").map((r) => r.id)).toEqual([
      1, 3, 4, 2, 5,
    ]);
    expect(rows.map((r) => r.id)).toEqual([1, 2, 3, 4, 5]);
  });
});
