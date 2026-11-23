import { describe, expect, it } from "vitest";
import {
  buildSheets,
  checkRooms,
  defaultInstructorText,
  examLine,
  fileName,
  formatDate,
  formatTime,
  nextRoom,
  to12h,
  to24h,
} from "./sheetModel";

const mk = (n, programme, section = "") =>
  Array.from({ length: n }, (_, i) => ({
    roll_no: `${programme}${i}`,
    name: `N ${programme}${i}`,
    discipline: "CSE",
    programme,
    section,
  }));

const students = [
  ...mk(26, "B.Tech"),
  ...mk(38, "M.Tech"),
  ...mk(2, "PhD"),
].map((s, i) => ({ ...s, sno: i + 1 }));

const room = (over) => ({
  from_sno: 1,
  to_sno: 20,
  room: "L201",
  date: "2026-09-22",
  start_time: "15:00",
  end_time: "17:00",
  instructor_text: "PROF. X",
  ...over,
});

describe("times", () => {
  it("converts 12h to 24h", () => {
    expect(to24h({ hour: "12", minute: "00", period: "AM" })).toBe("00:00");
    expect(to24h({ hour: "12", minute: "30", period: "PM" })).toBe("12:30");
    expect(to24h({ hour: "03", minute: "00", period: "PM" })).toBe("15:00");
  });
  it("converts 24h to 12h", () => {
    expect(to12h("00:15")).toEqual({ hour: "12", minute: "15", period: "AM" });
    expect(to12h("15:00")).toEqual({ hour: "03", minute: "00", period: "PM" });
  });
  it("formats", () => {
    expect(formatTime("15:00")).toBe("03:00 PM");
    expect(formatDate("2026-09-22")).toBe("22.09.2026");
  });
});

describe("labels", () => {
  it("examLine", () => {
    expect(examLine("END", "Even Semester", "2026-27")).toBe(
      "END SEM EXAM (Even Sem), 2026-27",
    );
    expect(examLine("MID", "Odd Semester", "2026-27")).toBe(
      "MID SEM EXAM (Odd Sem), 2026-27",
    );
  });
  it("fileName", () => {
    expect(fileName("CS8004", "MID", "2026-27")).toBe(
      "CS8004_MidSem_2026-27.pdf",
    );
    expect(fileName("CS8004", "END", "2026-27")).toBe(
      "CS8004_EndSem_2026-27.pdf",
    );
  });
});

describe("defaultInstructorText", () => {
  const sec = [...mk(3, "B.Tech", "A"), ...mk(3, "B.Tech", "B")].map(
    (s, i) => ({ ...s, sno: i + 1 }),
  );
  it("one section", () => {
    expect(
      defaultInstructorText(
        sec,
        1,
        3,
        { by_section: { A: "PROF. X", B: "PROF. Y" }, all: [] },
        true,
      ),
    ).toBe("PROF. X");
  });
  it("two sections", () => {
    expect(
      defaultInstructorText(
        sec,
        1,
        6,
        { by_section: { A: "PROF. X", B: "PROF. Y" }, all: [] },
        true,
      ),
    ).toBe("A: PROF. X, B: PROF. Y");
  });
  it("only sections with an offering", () => {
    expect(
      defaultInstructorText(
        sec,
        1,
        6,
        { by_section: { B: "PROF. Y" }, all: [] },
        true,
      ),
    ).toBe("PROF. Y");
  });
  it("not sectioned", () => {
    expect(
      defaultInstructorText(
        students,
        1,
        5,
        { by_section: {}, all: ["PROF. X", "PROF. Z"] },
        false,
      ),
    ).toBe("PROF. X, PROF. Z");
  });
  it("none", () => {
    expect(
      defaultInstructorText(sec, 1, 6, { by_section: {}, all: [] }, true),
    ).toBe("");
    expect(
      defaultInstructorText(students, 1, 5, { by_section: {}, all: [] }, false),
    ).toBe("");
  });
});

describe("checkRooms", () => {
  it("empty", () => {
    expect(checkRooms([], 10).errors).toEqual(["Add at least one room."]);
  });
  it("overlap", () => {
    const r = checkRooms(
      [room({ to_sno: 20 }), room({ from_sno: 20, to_sno: 30, room: "L202" })],
      30,
    );
    expect(r.errors).toEqual(["Rooms 1 and 2 overlap."]);
  });
  it("messages", () => {
    expect(checkRooms([room({ from_sno: 9, to_sno: 5 })], 30).errors).toEqual([
      "Room 1: from S.No must not be after to S.No.",
    ]);
    expect(checkRooms([room({ to_sno: 31 })], 30).errors).toEqual([
      "Room 1: S.No must be between 1 and 30.",
    ]);
    expect(checkRooms([room({ room: "", to_sno: 30 })], 30).errors).toEqual([
      "Room 1: room, date, start and end time are required.",
    ]);
    expect(
      checkRooms([room({ end_time: "14:00", to_sno: 30 })], 30).errors,
    ).toEqual(["Room 1: the exam must end after it starts."]);
  });
  it("uncovered", () => {
    const r = checkRooms(
      [
        room({ from_sno: 1, to_sno: 20 }),
        room({ from_sno: 30, to_sno: 30, room: "L2" }),
      ],
      30,
    );
    expect(r.uncovered).toEqual([21, 22, 23, 24, 25, 26, 27, 28, 29]);
  });
  it("beyond", () => {
    const r = checkRooms(
      [room({ to_sno: 20 }), room({ from_sno: 21, to_sno: 45, room: "L2" })],
      40,
    );
    expect(r.beyond).toEqual([2]);
  });
});

describe("nextRoom", () => {
  it("copies from previous", () => {
    expect(nextRoom(room({ to_sno: 20 }), 66)).toMatchObject({
      from_sno: 21,
      to_sno: 66,
      room: "",
      date: "2026-09-22",
      start_time: "15:00",
      end_time: "17:00",
    });
  });
  it("first room", () => {
    expect(nextRoom(undefined, 66)).toMatchObject({
      from_sno: 1,
      to_sno: 66,
      room: "",
    });
  });
});

describe("buildSheets", () => {
  const base = {
    course: { code: "CS8004", name: "Topic" },
    exam: "MID",
    semesterType: "Odd Semester",
    academicYear: "2026-27",
    students,
  };
  it("splits a room by programme", () => {
    const sheets = buildSheets({
      ...base,
      rooms: [room({ from_sno: 21, to_sno: 66, room: "L104" })],
    });
    expect(sheets.map((s) => s.total)).toEqual([6, 38, 2]);
    expect(sheets.map((s) => s.rows[0].slNo)).toEqual([1, 1, 1]);
    expect(sheets[0]).toMatchObject({
      room: "L104",
      dateText: "DATE: 22.09.2026",
      timeText: "Time : 03:00 PM To 05:00 PM",
      examLine: "MID SEM EXAM (Odd Sem), 2026-27",
      code: "CS8004",
      title: "Topic",
      instructorText: "PROF. X",
    });
    expect(sheets[0].rows[0]).toEqual({
      slNo: 1,
      roll_no: "B.Tech20",
      name: "N B.Tech20",
      discipline: "CSE",
      section: "",
    });
  });
  it("single sheet", () => {
    const sheets = buildSheets({ ...base, rooms: [room()] });
    expect(sheets).toHaveLength(1);
    expect(sheets[0].total).toBe(20);
  });
  it("empty room gives no sheet", () => {
    expect(
      buildSheets({ ...base, rooms: [room({ from_sno: 100, to_sno: 110 })] }),
    ).toEqual([]);
  });
});
