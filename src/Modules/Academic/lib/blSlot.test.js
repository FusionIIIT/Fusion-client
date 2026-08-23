import { describe, expect, it } from "vitest";

import {
  blSlotReady,
  courseRequestBody,
  isBlSlot,
  offerableCourses,
  registeredCourse,
  slotReady,
  sortSlots,
  sourceNote,
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

  it("still offers the slot's own source, so the course can be retaken", () => {
    const slots = [{ selectedSource: "2", selectedCourse: "" }];
    const taken = takenCourseIds(slots);
    const offered = offerableCourses(courses, taken, ["", "2"]);
    expect(offered.map((c) => c.id)).toEqual([1, 2, 3]);
  });

  it("keeps that source out of a different slot", () => {
    const slots = [
      { selectedSource: "2", selectedCourse: "" },
      { selectedSource: "", selectedCourse: "" },
    ];
    const taken = takenCourseIds(slots);
    const offered = offerableCourses(courses, taken, ["", ""]);
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

describe("registeredCourse", () => {
  const source = {
    id: 7,
    code: "CS8007",
    name: "Social Network Analysis",
    replaceable: true,
    registration_type: "Improvement",
  };
  const standIn = { id: 9, code: "CS8013", name: "Mobile" };

  it("returns the stand-in a replaceable source was swapped for", () => {
    const slot = {
      sourceCourses: [source],
      courses: [standIn],
      selectedSource: "7",
      selectedCourse: "9",
    };
    expect(registeredCourse(slot).code).toBe("CS8013");
  });

  it("returns the source itself when it is being retaken", () => {
    const slot = {
      sourceCourses: [source],
      courses: [standIn],
      selectedSource: "7",
      selectedCourse: "7",
    };
    expect(registeredCourse(slot).code).toBe("CS8007");
  });

  it("returns the source for a slot that cannot be replaced at all", () => {
    const fixed = { ...source, replaceable: false };
    const slot = {
      sourceCourses: [fixed],
      courses: [standIn],
      selectedSource: "7",
      selectedCourse: "",
    };
    expect(registeredCourse(slot).code).toBe("CS8007");
  });

  it("returns the plain choice for a slot with no source at all", () => {
    expect(
      registeredCourse({ courses: [standIn], selectedCourse: "9" }).code,
    ).toBe("CS8013");
  });

  it("returns null when nothing is chosen yet", () => {
    expect(
      registeredCourse({ courses: [standIn], selectedCourse: "" }),
    ).toBeNull();
  });
});

describe("sourceNote", () => {
  it("calls it a retake when the same course is taken again", () => {
    expect(sourceNote("CS8007", "CS8007", "Improvement")).toBe(
      "Retake \u00b7 Improvement",
    );
  });

  it("names the course a stand-in replaces", () => {
    expect(sourceNote("OE3C42", "CS8007", "Improvement")).toBe(
      "Replaces CS8007 \u00b7 Improvement",
    );
  });

  it("drops the type when there is none", () => {
    expect(sourceNote("OE3C42", "CS8007", null)).toBe("Replaces CS8007");
  });

  it("says nothing for a registration that clears nothing", () => {
    expect(sourceNote("OE3C42", null, "Regular")).toBe("");
  });
});
