import { describe, expect, it } from "vitest";

import {
  blSlotReady,
  courseRequestBody,
  isBlSlot,
  offerableCourses,
  slotReady,
  sortSlots,
  sourceOf,
  takenCourseIds,
} from "./blSlot";

const OE_SOURCE = {
  id: 229,
  code: "CS8004",
  grade: "C",
  registration_type: "Improvement",
  replaceable: true,
};
const RETAKE_SOURCE = {
  id: 501,
  code: "DS5001",
  grade: "F",
  registration_type: "Backlog",
  replaceable: false,
};

const blSlot = (over = {}) => ({
  id: 2175,
  sourceCourses: [OE_SOURCE, RETAKE_SOURCE],
  selectedSource: "",
  selectedCourse: "",
  ...over,
});

const plainSlot = (over = {}) => ({ id: 90, selectedCourse: "", ...over });

describe("isBlSlot", () => {
  it("recognises a slot that offers source courses", () => {
    expect(isBlSlot(blSlot())).toBe(true);
    expect(isBlSlot({ ...blSlot(), sourceCourses: [] })).toBe(true);
  });

  it("treats a slot without them as an ordinary slot", () => {
    expect(isBlSlot(plainSlot())).toBe(false);
    expect(isBlSlot(undefined)).toBe(false);
  });
});

describe("sourceOf", () => {
  it("resolves the chosen source course", () => {
    expect(sourceOf(blSlot({ selectedSource: "229" }))).toBe(OE_SOURCE);
  });

  it("is null before anything is chosen", () => {
    expect(sourceOf(blSlot())).toBeNull();
    expect(sourceOf(plainSlot({ selectedCourse: "7" }))).toBeNull();
  });
});

describe("blSlotReady", () => {
  it("needs a stand-in when the source was an open elective", () => {
    expect(blSlotReady(blSlot({ selectedSource: "229" }))).toBe(false);
    expect(
      blSlotReady(blSlot({ selectedSource: "229", selectedCourse: "77" })),
    ).toBe(true);
  });

  it("needs only the source when the course has to be retaken", () => {
    expect(blSlotReady(blSlot({ selectedSource: "501" }))).toBe(true);
  });

  it("is not ready with no source", () => {
    expect(blSlotReady(blSlot())).toBe(false);
  });
});

describe("slotReady", () => {
  it("falls back to the plain course choice off a BL slot", () => {
    expect(slotReady(plainSlot())).toBe(false);
    expect(slotReady(plainSlot({ selectedCourse: "12" }))).toBe(true);
  });
});

describe("courseRequestBody", () => {
  it("sends the stand-in for a replaceable source", () => {
    expect(
      courseRequestBody(
        blSlot({ selectedSource: "229", selectedCourse: "77" }),
      ),
    ).toEqual({ slot_id: 2175, source_course_id: 229, course_id: 77 });
  });

  it("re-registers the same course when it cannot be replaced", () => {
    expect(courseRequestBody(blSlot({ selectedSource: "501" }))).toEqual({
      slot_id: 2175,
      source_course_id: 501,
      course_id: 501,
    });
  });

  it("ignores a stand-in picked before the source changed to a retake", () => {
    expect(
      courseRequestBody(
        blSlot({ selectedSource: "501", selectedCourse: "77" }),
      ),
    ).toEqual({ slot_id: 2175, source_course_id: 501, course_id: 501 });
  });

  it("omits the source for an ordinary slot", () => {
    expect(courseRequestBody(plainSlot({ selectedCourse: "12" }))).toEqual({
      slot_id: 90,
      course_id: 12,
    });
  });
});

describe("takenCourseIds", () => {
  it("collects every course already picked, as source or as replacement", () => {
    const taken = takenCourseIds([
      { selectedSource: "10", selectedCourse: "20" },
      { selectedSource: "", selectedCourse: "30" },
      { selectedSource: "40", selectedCourse: "" },
    ]);
    expect([...taken].sort()).toEqual(["10", "20", "30", "40"]);
  });

  it("survives missing and empty slots", () => {
    expect(takenCourseIds(undefined).size).toBe(0);
    expect(takenCourseIds([null, {}]).size).toBe(0);
  });
});

describe("offerableCourses", () => {
  const courses = [{ id: 1 }, { id: 2 }, { id: 3 }];

  it("drops a course another slot already claimed", () => {
    const offered = offerableCourses(courses, new Set(["2"]), "");
    expect(offered.map((c) => c.id)).toEqual([1, 3]);
  });

  it("keeps the course this field itself is holding", () => {
    const offered = offerableCourses(courses, new Set(["2", "3"]), "3");
    expect(offered.map((c) => c.id)).toEqual([1, 3]);
  });

  it("offers everything when nothing is taken", () => {
    expect(offerableCourses(courses, new Set(), "").map((c) => c.id)).toEqual([
      1, 2, 3,
    ]);
  });
});

describe("sortSlots", () => {
  it("puts BL1 before BL2, whatever order they arrived in", () => {
    const sorted = sortSlots([{ name: "BL2" }, { name: "BL1" }]);
    expect(sorted.map((s) => s.name)).toEqual(["BL1", "BL2"]);
  });

  it("orders by number, not by text, so BL10 follows BL2", () => {
    const sorted = sortSlots([
      { name: "BL10" },
      { name: "BL2" },
      { name: "BL1" },
    ]);
    expect(sorted.map((s) => s.name)).toEqual(["BL1", "BL2", "BL10"]);
  });

  it("groups slot families together", () => {
    const sorted = sortSlots([
      { name: "TH3" },
      { name: "BL2" },
      { name: "SEM3" },
      { name: "BL1" },
    ]);
    expect(sorted.map((s) => s.name)).toEqual(["BL1", "BL2", "SEM3", "TH3"]);
  });

  it("does not mutate the list it was given", () => {
    const input = [{ name: "BL2" }, { name: "BL1" }];
    sortSlots(input);
    expect(input.map((s) => s.name)).toEqual(["BL2", "BL1"]);
  });
});
