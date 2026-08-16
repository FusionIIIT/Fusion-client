import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import CourseList from "./CourseList";
import { courseLabel } from "../../../lib/course";

const COURSES = [
  { id: 1, code: "CS3010", name: "Data Mining and Data Warehousing" },
  { id: 2, code: "ME2020", name: "Thermodynamics+Solid Mechanics" },
];

describe("CourseList", () => {
  it("renders one entry per course, so two courses never read as one", () => {
    render(<CourseList courses={COURSES} />);
    expect(screen.getAllByRole("listitem").map((li) => li.textContent)).toEqual(
      [
        "CS3010 — Data Mining and Data Warehousing",
        "ME2020 — Thermodynamics+Solid Mechanics",
      ],
    );
  });

  it("numbers the entries", () => {
    render(<CourseList courses={COURSES} />);
    expect(screen.getByRole("list").tagName).toBe("OL");
  });

  it("shows an em dash when the slot has no courses", () => {
    const { container } = render(<CourseList courses={[]} />);
    expect(container).toHaveTextContent("—");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("tolerates a missing courses prop", () => {
    const { container } = render(<CourseList />);
    expect(container).toHaveTextContent("—");
  });
});

describe("courseLabel", () => {
  it("joins code and name", () => {
    expect(courseLabel(COURSES[0])).toBe(
      "CS3010 — Data Mining and Data Warehousing",
    );
  });

  it.each([
    [{ name: "Only Name" }, "Only Name"],
    [{ code: "CS101" }, "CS101"],
    [undefined, ""],
  ])("degrades to %s", (course, expected) => {
    expect(courseLabel(course)).toBe(expected);
  });
});
