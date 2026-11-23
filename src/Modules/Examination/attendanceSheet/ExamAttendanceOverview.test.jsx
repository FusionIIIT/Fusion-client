import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, within } from "@testing-library/react";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import ExamAttendanceOverview from "./ExamAttendanceOverview";
import { attendanceSheetOverviewRoute } from "../routes/examinationRoutes";
import { theme } from "../../../ui/theme/theme";

vi.mock("axios", () => ({ default: { get: vi.fn() } }));

const course = (id, code, name) => ({ id, code, name });
const DL = course(7, "CS8004", "Deep Learning");
const INTRO = course(8, "CS1001", "Intro");
const VLSI = course(9, "EC2002", "VLSI");

const row = (over) => ({
  course: DL,
  room: "L201",
  date: "2026-09-22",
  start_time: "09:00",
  end_time: "11:00",
  from_sno: 1,
  to_sno: 20,
  students: 20,
  instructor_text: "PROF. A OJHA",
  roll_changed: false,
  shares_with: [],
  ...over,
});

const OVERVIEW = {
  courses: 3,
  planned: 2,
  rooms: [
    row({ course: INTRO, room: "L105", shares_with: ["CS8004"] }),
    row({
      room: "L105",
      from_sno: 21,
      to_sno: 46,
      students: 26,
      shares_with: ["CS1001"],
    }),
    row({
      date: "2026-09-23",
      start_time: "15:00",
      end_time: "17:00",
      roll_changed: true,
    }),
  ],
  unplanned: [VLSI],
};

let onOpen;

function show(data = OVERVIEW) {
  axios.get.mockReset();
  axios.get.mockResolvedValue({ data });
  onOpen = vi.fn();
  return render(
    <MantineProvider theme={theme}>
      <ExamAttendanceOverview
        academicYear="2026-27"
        semesterType="Odd Semester"
        exam="MID"
        onOpen={onOpen}
      />
    </MantineProvider>,
  );
}

const bodyRows = () => screen.getAllByRole("row").slice(1);

describe("ExamAttendanceOverview", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", { getItem: vi.fn(() => "token") });
  });

  it("asks for the chosen term and exam", async () => {
    show();
    await screen.findByText("L201");
    expect(axios.get).toHaveBeenCalledWith(attendanceSheetOverviewRoute, {
      params: {
        academic_year: "2026-27",
        semester_type: "Odd Semester",
        exam: "MID",
      },
      headers: { Authorization: "Token token" },
    });
  });

  it("shows the totals and one row per room, in the order given", async () => {
    show();
    await screen.findByText("L201");
    expect(screen.getByText("3 courses")).toBeInTheDocument();
    expect(screen.getByText("2 planned")).toBeInTheDocument();
    expect(screen.getByText("1 not planned")).toBeInTheDocument();
    expect(screen.getByText("2 rooms shared")).toBeInTheDocument();
    const rows = bodyRows();
    expect(rows).toHaveLength(3);
    const cells = (r) =>
      within(r)
        .getAllByRole("cell")
        .map((c) => c.textContent);
    expect(cells(rows[2]).slice(0, 7)).toEqual([
      "23.09.2026",
      "03:00 PM - 05:00 PM",
      "L201",
      "CS8004 - Deep Learning",
      "1-20",
      "20",
      "PROF. A OJHA",
    ]);
    expect(cells(rows[0])[2]).toBe("L105");
  });

  it("flags a room shared at the same time and a changed roll list", async () => {
    show();
    await screen.findByText("L201");
    const rows = bodyRows();
    expect(
      within(rows[0]).getByText("Also CS8004 at this time"),
    ).toBeInTheDocument();
    expect(
      within(rows[1]).getByText("Also CS1001 at this time"),
    ).toBeInTheDocument();
    expect(within(rows[2]).getByText("Roll list changed")).toBeInTheDocument();
    expect(within(rows[2]).queryByText(/at this time/)).toBeNull();
  });

  it("opens a course from its row or from the not-planned list", async () => {
    show();
    await screen.findByText("L201");
    fireEvent.click(
      within(bodyRows()[0]).getByRole("button", { name: "CS1001 - Intro" }),
    );
    expect(onOpen).toHaveBeenLastCalledWith(8);
    fireEvent.click(screen.getByRole("button", { name: "EC2002 - VLSI" }));
    expect(onOpen).toHaveBeenLastCalledWith(9);
  });

  it("says when nothing is saved yet", async () => {
    show({ courses: 2, planned: 0, rooms: [], unplanned: [DL, INTRO] });
    expect(
      await screen.findByText("No rooms saved for Mid Sem in this term yet."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
    expect(
      screen.getByRole("button", { name: "CS1001 - Intro" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/rooms? shared/)).toBeNull();
  });

  it("says when every course is planned", async () => {
    show({ ...OVERVIEW, courses: 2, unplanned: [] });
    await screen.findByText("L201");
    expect(
      screen.getByText("Every course has a plan for Mid Sem."),
    ).toBeInTheDocument();
  });

  it("shows the server's message when it cannot load", async () => {
    show();
    axios.get.mockReset();
    axios.get.mockRejectedValue({
      response: { data: { detail: "Exam must be MID or END." } },
    });
    render(
      <MantineProvider theme={theme}>
        <ExamAttendanceOverview
          academicYear="2026-27"
          semesterType="Odd Semester"
          exam="END"
          onOpen={onOpen}
        />
      </MantineProvider>,
    );
    expect(
      await screen.findByText("Exam must be MID or END."),
    ).toBeInTheDocument();
  });

  it("loads again when the exam changes", async () => {
    const view = show();
    await screen.findByText("L201");
    axios.get.mockResolvedValue({
      data: { courses: 3, planned: 0, rooms: [], unplanned: [DL, INTRO, VLSI] },
    });
    view.rerender(
      <MantineProvider theme={theme}>
        <ExamAttendanceOverview
          academicYear="2026-27"
          semesterType="Odd Semester"
          exam="END"
          onOpen={onOpen}
        />
      </MantineProvider>,
    );
    expect(
      await screen.findByText("No rooms saved for End Sem in this term yet."),
    ).toBeInTheDocument();
    expect(axios.get).toHaveBeenLastCalledWith(
      attendanceSheetOverviewRoute,
      expect.objectContaining({
        params: expect.objectContaining({ exam: "END" }),
      }),
    );
  });
});
