import { describe, expect, it } from "vitest";

import {
  blSlotReady,
  courseRequestBody,
  isBlSlot,
  slotReady,
  sourceOf,
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
