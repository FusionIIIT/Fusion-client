import fs from "node:fs";
import path from "node:path";
import { MantineProvider } from "@mantine/core";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import FusionTable from "./FusionTable";
import { theme } from "../ui/theme/theme";

const COLUMNS = [
  "Course Code",
  "Course Name",
  "Registration Type",
  "Semester",
  "Credits",
  "Replaced By",
];

const ROW = {
  id: "PR4001",
  "Course Code": "PR4001",
  "Course Name": "Project-based Internship",
  "Registration Type": "Regular",
  Semester: 7,
  Credits: 15,
};

const renderTable = (props = {}) =>
  render(
    <MantineProvider theme={theme}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <FusionTable columnNames={COLUMNS} elements={[ROW]} {...props} />
    </MantineProvider>,
  );

const table = () => within(screen.getByRole("table"));
const cards = () => within(screen.getByTestId("fusion-table-cards"));

describe("FusionTable — wide layout", () => {
  it("renders every column as a scoped header", () => {
    renderTable();
    COLUMNS.forEach((c) => {
      const header = table().getByText(c);
      expect(header.closest("th")).toHaveAttribute("scope", "col");
    });
  });

  it("renders a row's cells in column order", () => {
    renderTable();
    expect(
      table()
        .getAllByRole("cell")
        .map((c) => c.textContent),
    ).toEqual([
      "PR4001",
      "Project-based Internship",
      "Regular",
      "7",
      "15",
      "—",
    ]);
  });
});

describe("FusionTable — narrow layout", () => {
  it("keeps every column's label and value reachable without scrolling", () => {
    renderTable();
    COLUMNS.forEach((c) => expect(cards().getByText(c)).toBeInTheDocument());
    ["PR4001", "Project-based Internship", "Regular", "7", "15"].forEach((v) =>
      expect(cards().getByText(v)).toBeInTheDocument(),
    );
  });

  it("renders one card per row", () => {
    renderTable({
      elements: [ROW, { ...ROW, id: "CS3010", "Course Code": "CS3010" }],
    });
    expect(cards().getAllByText("Course Code")).toHaveLength(2);
  });

  it("shows an em dash for a missing value, as the table does", () => {
    renderTable();
    expect(cards().getByText("—")).toBeInTheDocument();
  });

  it("blockifies the label and value themselves, not via the row", () => {
    const css = fs.readFileSync(
      path.resolve(__dirname, "FusionTable.module.css"),
      "utf8",
    );
    const declares = (selector) =>
      new RegExp(`\\.${selector}\\s*\\{[^}]*display:\\s*block`).test(css);
    expect({ label: declares("label"), value: declares("value") }).toEqual({
      label: true,
      value: true,
    });
  });

  it("lets the narrow-width rule outrank the base value rule", () => {
    const css = fs.readFileSync(
      path.resolve(__dirname, "FusionTable.module.css"),
      "utf8",
    );
    const media = css.indexOf("@media (max-width: 374px)");
    expect(media).toBeGreaterThan(css.search(/^\.value\s*\{/m));
    expect(css.slice(media)).toMatch(/\.row\s+\.value\s*\{/);
  });
});

describe("FusionTable — shared behaviour", () => {
  it("explains an empty result instead of rendering a headers-only table", () => {
    renderTable({ elements: [] });
    expect(screen.getByText("No data available")).toBeInTheDocument();
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.queryByTestId("fusion-table-cards")).not.toBeInTheDocument();
  });

  it("accepts a caller-supplied empty message", () => {
    renderTable({ elements: [], emptyMessage: "No courses registered yet." });
    expect(screen.getByText("No courses registered yet.")).toBeInTheDocument();
  });

  it("guards against being given no columns", () => {
    renderTable({ columnNames: [] });
    expect(screen.getByText("No columns defined")).toBeInTheDocument();
  });

  it("labels the table for assistive tech", () => {
    renderTable({ ariaLabel: "Registered courses" });
    expect(
      screen.getByRole("table", { name: "Registered courses" }),
    ).toBeInTheDocument();
  });

  it("falls back to the caption as the accessible name", () => {
    renderTable({ caption: "Semester 7" });
    expect(
      screen.getByRole("table", { name: "Semester 7" }),
    ).toBeInTheDocument();
  });
});
