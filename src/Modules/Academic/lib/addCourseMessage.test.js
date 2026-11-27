import { describe, expect, it } from "vitest";

import { addCourseMessage } from "./addCourseMessage";

describe("addCourseMessage", () => {
  it("passes on why the course went in as Backlog", () => {
    expect(
      addCourseMessage({
        message: "Course added as Backlog: 23BEC020 dropped semester 6.",
      }),
    ).toBe("Course added as Backlog: 23BEC020 dropped semester 6.");
  });

  it("falls back to the usual text", () => {
    expect(addCourseMessage(undefined)).toBe(
      "Course has been added successfully",
    );
    expect(addCourseMessage({})).toBe("Course has been added successfully");
  });
});
