import { MantineProvider } from "@mantine/core";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ExamAttendanceSheet from "./ExamAttendanceSheet";
import { loadLogo, renderAttendancePdf } from "./drawAttendanceSheet";
import { EXAMINATION_PAGES } from "../pages";
import {
  attendanceSheetCopyRoute,
  attendanceSheetCoursesRoute,
  attendanceSheetOverviewRoute,
  attendanceSheetRoute,
  attendanceSheetSaveRoute,
} from "../routes/examinationRoutes";
import { theme } from "../../../ui/theme/theme";

vi.mock("axios", () => ({ default: { get: vi.fn(), post: vi.fn() } }));
vi.mock("./drawAttendanceSheet", () => ({
  renderAttendancePdf: vi.fn(async () => ({
    output: () => new Blob(["%PDF"]),
  })),
  loadLogo: vi.fn(async () => "data:image/png;base64,"),
}));

const HEADERS = { headers: { Authorization: "Token token" } };
const TERM = { academic_year: "2026-27", semester_type: "Odd Semester" };

const COURSES = [
  { id: 7, code: "CS8004", name: "Machine Learning", plans: ["MID"] },
  { id: 8, code: "CS1001", name: "Programming", plans: [] },
  { id: 9, code: "EC2001", name: "Signals", plans: ["END"] },
  { id: 10, code: "ME3001", name: "Machines", plans: ["MID", "END"] },
];

const studentsOf = (count, prefix = "23BCS", sectionOf = () => "A") =>
  Array.from({ length: count }, (_, i) => ({
    sno: i + 1,
    roll_no: `${prefix}${String(i + 1).padStart(3, "0")}`,
    name: `Student ${i + 1}`,
    discipline: "CSE",
    programme: "B.Tech",
    section: sectionOf(i + 1),
  }));

const ROOM = {
  from_sno: 1,
  to_sno: 45,
  room: "LT-1",
  date: "2026-12-01",
  start_time: "09:00",
  end_time: "17:00",
  instructor_text: "Dr. A Kumar",
};

const PLAN = {
  exam: "MID",
  roll_count: 45,
  updated_at: "2026-11-20T10:00:00+05:30",
  updated_by: "skjain",
  rooms: [ROOM],
};

const ML = { id: 7, code: "CS8004", name: "Machine Learning" };
const PROGRAMMING = { id: 8, code: "CS1001", name: "Programming" };

const sheetBody = ({
  plan = PLAN,
  count = 45,
  exam = "MID",
  course = ML,
  prefix = "23BCS",
  sectioned = false,
  sectionOf,
  instructors = { by_section: {}, all: ["Dr. A Kumar"] },
} = {}) => ({
  course,
  ...TERM,
  exam,
  sectioned,
  students: studentsOf(count, prefix, sectionOf),
  instructors,
  plan,
});

let sheet;
let view;

// Choosing a course starts a request; act lets its answer land inside it.
async function pick(label, option) {
  fireEvent.click(screen.getByRole("textbox", { name: label }));
  const choice = await screen.findByRole("option", { name: option });
  await act(async () => {
    fireEvent.click(choice);
  });
}

async function openCourse() {
  await pick("Course", "CS8004 - Machine Learning (Mid Sem saved)");
  await screen.findByText("23BCS001");
}

describe("ExamAttendanceSheet", () => {
  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-23T10:00:00+05:30"));
    vi.stubGlobal("localStorage", { getItem: vi.fn(() => "token") });
    let made = 0;
    URL.createObjectURL = vi.fn(() => {
      made += 1;
      return `blob:pdf-${made}`;
    });
    URL.revokeObjectURL = vi.fn();
    loadLogo.mockReset();
    loadLogo.mockResolvedValue("data:image/png;base64,");
    renderAttendancePdf.mockClear();
    Element.prototype.scrollIntoView = vi.fn();
    sheet = sheetBody();
    axios.get.mockReset();
    axios.post.mockReset();
    axios.get.mockImplementation((url) =>
      Promise.resolve({
        data: url === attendanceSheetCoursesRoute ? COURSES : sheet,
      }),
    );
    view = render(
      <MantineProvider theme={theme}>
        <ExamAttendanceSheet />
      </MantineProvider>,
    );
    // Let the course list for the default term arrive.
    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith(attendanceSheetCoursesRoute, {
        params: TERM,
        ...HEADERS,
      }),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("lists courses for the chosen term and marks saved plans", async () => {
    expect(axios.get).toHaveBeenCalledWith(attendanceSheetCoursesRoute, {
      params: TERM,
      ...HEADERS,
    });
    fireEvent.click(screen.getByRole("textbox", { name: "Course" }));
    expect(
      await screen.findByRole("option", {
        name: "CS8004 - Machine Learning (Mid Sem saved)",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "CS1001 - Programming" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "EC2001 - Signals (End Sem saved)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", {
        name: "ME3001 - Machines (Mid and End Sem saved)",
      }),
    ).toBeInTheDocument();
  });

  it("loads a saved plan and shows who saved it", async () => {
    await openCourse();
    expect(axios.get).toHaveBeenCalledWith(attendanceSheetRoute, {
      params: { course: "7", ...TERM, exam: "MID" },
      ...HEADERS,
    });
    expect(
      screen.getByText(
        `Saved by skjain, ${new Date(PLAN.updated_at).toLocaleString("en-IN")}`,
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Room 1 room" })).toHaveValue(
      "LT-1",
    );
    expect(screen.getByLabelText("Room 1 date")).toHaveValue("2026-12-01");
    expect(
      screen.getByRole("textbox", { name: "Room 1 end hour" }),
    ).toHaveValue("05");
    expect(
      screen.getByRole("textbox", { name: "Room 1 end period" }),
    ).toHaveValue("PM");
  });

  it("starts a new plan with one room for the whole roll list", async () => {
    sheet = sheetBody({ plan: null });
    await openCourse();
    expect(
      screen.getByRole("textbox", { name: "Room 1 from S.No" }),
    ).toHaveValue("1");
    expect(screen.getByRole("textbox", { name: "Room 1 to S.No" })).toHaveValue(
      "45",
    );
    expect(
      screen.getByRole("textbox", { name: "Room 1 instructors" }),
    ).toHaveValue("Dr. A Kumar");
    expect(screen.queryByText(/^Saved by/)).toBeNull();
    expect(screen.queryByRole("button", { name: /^Copy to/ })).toBeNull();
  });

  it("prefills the next room from the previous one", async () => {
    sheet = sheetBody({ plan: { ...PLAN, rooms: [{ ...ROOM, to_sno: 20 }] } });
    await openCourse();
    fireEvent.click(screen.getByRole("button", { name: "Add room" }));
    expect(
      screen.getByRole("textbox", { name: "Room 2 from S.No" }),
    ).toHaveValue("21");
    expect(screen.getByRole("textbox", { name: "Room 2 to S.No" })).toHaveValue(
      "45",
    );
    expect(screen.getByLabelText("Room 2 date")).toHaveValue("2026-12-01");
    expect(
      screen.getByRole("textbox", { name: "Room 2 instructors" }),
    ).toHaveValue("Dr. A Kumar");
  });

  it("blocks saving overlapping ranges", async () => {
    sheet = sheetBody({
      plan: {
        ...PLAN,
        rooms: [
          { ...ROOM, to_sno: 20 },
          { ...ROOM, from_sno: 21, room: "LT-2" },
        ],
      },
    });
    await openCourse();
    expect(screen.getByRole("button", { name: "Save" })).toBeEnabled();
    fireEvent.change(
      screen.getByRole("textbox", { name: "Room 2 from S.No" }),
      {
        target: { value: "20" },
      },
    );
    expect(
      await screen.findByText("Rooms 1 and 2 overlap."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
  });

  it("warns when the roll list changed since saving", async () => {
    sheet = sheetBody({ count: 46 });
    await openCourse();
    expect(
      screen.getByText("Roll list was 45 when saved, now 46."),
    ).toBeInTheDocument();
    expect(screen.getByText("No room for S.No 46.")).toBeInTheDocument();
  });

  it("saves and shows server errors", async () => {
    await openCourse();
    await pick("Room 1 start hour", "03");
    await pick("Room 1 start period", "PM");
    axios.post.mockRejectedValue({
      response: {
        status: 400,
        data: {
          detail: "Fix these, then save.",
          errors: ["Room 1: LT-1 is not a room."],
        },
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(
      await screen.findByText("Room 1: LT-1 is not a room."),
    ).toBeInTheDocument();
    expect(screen.getByText("Fix these, then save.")).toBeInTheDocument();
    const [url, body, config] = axios.post.mock.calls[0];
    expect(url).toBe(attendanceSheetSaveRoute);
    expect(config).toEqual(HEADERS);
    expect(body).toEqual({
      course: 7,
      ...TERM,
      exam: "MID",
      updated_at: PLAN.updated_at,
      rooms: [{ ...ROOM, start_time: "15:00" }],
    });
  });

  it("shows who saved it once the save goes through", async () => {
    await openCourse();
    axios.post.mockResolvedValue({
      data: sheetBody({
        plan: {
          ...PLAN,
          updated_at: "2026-11-23T11:00:00+05:30",
          updated_by: "acadadmin",
        },
      }),
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(
      await screen.findByText(
        `Saved by acadadmin, ${new Date("2026-11-23T11:00:00+05:30").toLocaleString("en-IN")}`,
      ),
    ).toBeInTheDocument();
  });

  it("says so when someone else saved first", async () => {
    await openCourse();
    axios.post.mockRejectedValue({
      response: {
        status: 409,
        data: { detail: "Someone saved this plan after you opened it." },
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(
      await screen.findByText("Someone saved this plan after you opened it."),
    ).toBeInTheDocument();
  });

  it("copies Mid Sem to End Sem, asking before replacing", async () => {
    await openCourse();
    axios.post
      .mockRejectedValueOnce({
        response: {
          status: 409,
          data: { detail: "An End Sem plan exists.", exists: true },
        },
      })
      .mockResolvedValueOnce({
        data: sheetBody({ exam: "END", plan: { ...PLAN, exam: "END" } }),
      });
    fireEvent.click(screen.getByRole("button", { name: "Copy to End Sem" }));
    expect(
      await screen.findByText("An End Sem plan already exists. Replace it?"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Replace" }));
    expect(
      await screen.findByRole("button", { name: "Copy to Mid Sem" }),
    ).toBeInTheDocument();
    const copy = {
      course: 7,
      ...TERM,
      from_exam: "MID",
      to_exam: "END",
    };
    expect(axios.post.mock.calls).toEqual([
      [attendanceSheetCopyRoute, { ...copy, replace: false }, HEADERS],
      [attendanceSheetCopyRoute, { ...copy, replace: true }, HEADERS],
    ]);
    expect(screen.getByRole("textbox", { name: "Exam" })).toHaveValue(
      "End Sem",
    );
  });

  it("shows every course's rooms on the Overview tab and opens one from there", async () => {
    axios.get.mockImplementation((url) => {
      if (url === attendanceSheetCoursesRoute)
        return Promise.resolve({ data: COURSES });
      if (url === attendanceSheetOverviewRoute)
        return Promise.resolve({
          data: {
            courses: 4,
            planned: 2,
            rooms: [
              {
                course: ML,
                ...ROOM,
                students: 45,
                roll_changed: false,
                shares_with: [],
              },
            ],
            unplanned: [PROGRAMMING],
          },
        });
      return Promise.resolve({ data: sheet });
    });
    fireEvent.click(screen.getByRole("tab", { name: "Overview" }));
    expect(await screen.findByText("LT-1")).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(attendanceSheetOverviewRoute, {
      params: { ...TERM, exam: "MID" },
      ...HEADERS,
    });
    // The course picker belongs to the planner only.
    expect(screen.queryByRole("textbox", { name: "Course" })).toBeNull();

    sheet = sheetBody({ plan: null, course: PROGRAMMING });
    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: "CS1001 - Programming" }),
      );
    });
    expect(screen.getByRole("tab", { name: "Plan rooms" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(await screen.findByText("23BCS001")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Course" })).toHaveValue(
      "CS1001 - Programming",
    );
    expect(axios.get).toHaveBeenCalledWith(
      attendanceSheetRoute,
      expect.objectContaining({
        params: expect.objectContaining({ course: "8", exam: "MID" }),
      }),
    );
  });

  it("asks before opening another course from the overview over unsaved rooms", async () => {
    await openCourse();
    fireEvent.change(screen.getByRole("textbox", { name: "Room 1 room" }), {
      target: { value: "L999" },
    });
    axios.get.mockImplementation((url) =>
      Promise.resolve({
        data:
          url === attendanceSheetOverviewRoute
            ? { courses: 4, planned: 0, rooms: [], unplanned: [PROGRAMMING] }
            : COURSES,
      }),
    );
    fireEvent.click(screen.getByRole("tab", { name: "Overview" }));
    fireEvent.click(
      await screen.findByRole("button", { name: "CS1001 - Programming" }),
    );
    expect(
      await screen.findByText("Discard unsaved changes?"),
    ).toBeInTheDocument();
  });

  it("puts the rooms, then the preview, above the roll list", async () => {
    await openCourse();
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    const frame = await screen.findByTitle("Attendance sheet preview");
    const rooms = screen.getByRole("heading", { name: "Rooms" });
    const students = screen.getByRole("heading", { name: "Students (45)" });
    const before = (a, b) =>
      // eslint-disable-next-line no-bitwise
      Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(before(rooms, frame)).toBe(true);
    expect(before(frame, students)).toBe(true);
    expect(before(students, screen.getByText("23BCS001"))).toBe(true);
  });

  it("preview and download use the same PDF", async () => {
    await openCourse();
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    const frame = await screen.findByTitle("Attendance sheet preview");
    const link = screen.getByRole("link", { name: "Download PDF" });
    expect(frame.getAttribute("src")).toBe("blob:pdf-1");
    expect(link.getAttribute("href")).toBe(frame.getAttribute("src"));
    expect(link).toHaveAttribute("download", "CS8004_MidSem_2026-27.pdf");
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
    const [sheets, options] = renderAttendancePdf.mock.calls.at(-1);
    expect(options).toEqual({
      sectioned: false,
      logo: "data:image/png;base64,",
    });
    expect(sheets).toHaveLength(1);
    expect(sheets[0].timeText).toBe("Time : 09:00 AM To 05:00 PM");

    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    await waitFor(() =>
      expect(
        screen.getByTitle("Attendance sheet preview").getAttribute("src"),
      ).toBe("blob:pdf-2"),
    );
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:pdf-1");
  });

  it("draws the PDF without the logo when the logo cannot load", async () => {
    loadLogo.mockRejectedValue(new Event("error"));
    await openCourse();
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    const frame = await screen.findByTitle("Attendance sheet preview");
    expect(frame.getAttribute("src")).toBe("blob:pdf-1");
    expect(
      screen.getByRole("link", { name: "Download PDF" }).getAttribute("href"),
    ).toBe("blob:pdf-1");
    expect(renderAttendancePdf.mock.calls.at(-1)[1]).toEqual({
      sectioned: false,
      logo: null,
    });
  });

  it("re-suggests instructors when the range changes, unless they were typed in", async () => {
    sheet = sheetBody({
      plan: null,
      sectioned: true,
      sectionOf: (sno) => (sno <= 20 ? "A" : "B"),
      instructors: { by_section: { A: "Dr. A", B: "Dr. B" }, all: [] },
    });
    await openCourse();
    const instructors = () =>
      screen.getByRole("textbox", { name: "Room 1 instructors" });
    const to = () => screen.getByRole("textbox", { name: "Room 1 to S.No" });
    expect(instructors()).toHaveValue("A: Dr. A, B: Dr. B");

    fireEvent.change(to(), { target: { value: "20" } });
    await waitFor(() => expect(instructors()).toHaveValue("Dr. A"));

    fireEvent.change(instructors(), { target: { value: "Dr. X" } });
    fireEvent.change(to(), { target: { value: "30" } });
    await waitFor(() => expect(to()).toHaveValue("30"));
    expect(instructors()).toHaveValue("Dr. X");
  });

  it("drops a preview once the rooms change, so Download is never stale", async () => {
    await openCourse();
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    await screen.findByTitle("Attendance sheet preview");
    expect(screen.getByRole("link", { name: "Download PDF" })).toHaveAttribute(
      "href",
      "blob:pdf-1",
    );

    fireEvent.change(screen.getByLabelText("Room 1 date"), {
      target: { value: "2026-12-02" },
    });
    await waitFor(() =>
      expect(screen.queryByTitle("Attendance sheet preview")).toBeNull(),
    );
    expect(screen.queryByRole("link", { name: "Download PDF" })).toBeNull();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:pdf-1");

    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    const frame = await screen.findByTitle("Attendance sheet preview");
    expect(frame.getAttribute("src")).toBe("blob:pdf-2");
    expect(renderAttendancePdf.mock.calls.at(-1)[0][0].dateText).toBe(
      "DATE: 02.12.2026",
    );
  });

  it("throws away a preview whose rooms changed while it was drawn", async () => {
    let logoReady;
    loadLogo.mockReturnValue(
      new Promise((resolve) => {
        logoReady = resolve;
      }),
    );
    await openCourse();
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    fireEvent.change(screen.getByLabelText("Room 1 date"), {
      target: { value: "2026-12-02" },
    });
    await waitFor(() =>
      expect(screen.getByLabelText("Room 1 date")).toHaveValue("2026-12-02"),
    );
    await act(async () => {
      logoReady(null);
    });
    await waitFor(() =>
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:pdf-1"),
    );
    expect(screen.queryByTitle("Attendance sheet preview")).toBeNull();
    expect(screen.queryByRole("link", { name: "Download PDF" })).toBeNull();
  });

  it("re-suggests instructors on a saved room whose text was the suggestion", async () => {
    const sectioned = {
      sectioned: true,
      sectionOf: (sno) => (sno <= 20 ? "A" : "B"),
      instructors: { by_section: { A: "Dr. A", B: "Dr. B" }, all: [] },
    };
    sheet = sheetBody({
      ...sectioned,
      plan: {
        ...PLAN,
        rooms: [{ ...ROOM, instructor_text: "A: Dr. A, B: Dr. B" }],
      },
    });
    await openCourse();
    const instructors = () =>
      screen.getByRole("textbox", { name: "Room 1 instructors" });
    fireEvent.change(screen.getByRole("textbox", { name: "Room 1 to S.No" }), {
      target: { value: "20" },
    });
    await waitFor(() => expect(instructors()).toHaveValue("Dr. A"));
  });

  it("keeps a saved room's own instructor text when the range changes", async () => {
    sheet = sheetBody({
      sectioned: true,
      sectionOf: (sno) => (sno <= 20 ? "A" : "B"),
      instructors: { by_section: { A: "Dr. A", B: "Dr. B" }, all: [] },
      plan: { ...PLAN, rooms: [{ ...ROOM, instructor_text: "Dr. X" }] },
    });
    await openCourse();
    const to = () => screen.getByRole("textbox", { name: "Room 1 to S.No" });
    fireEvent.change(to(), { target: { value: "20" } });
    await waitFor(() => expect(to()).toHaveValue("20"));
    expect(
      screen.getByRole("textbox", { name: "Room 1 instructors" }),
    ).toHaveValue("Dr. X");
  });

  it("will not copy unsaved changes", async () => {
    await openCourse();
    const copy = () => screen.getByRole("button", { name: "Copy to End Sem" });
    expect(copy()).toBeEnabled();
    expect(screen.queryByText("Save first to copy your changes.")).toBeNull();

    fireEvent.change(screen.getByRole("textbox", { name: "Room 1 room" }), {
      target: { value: "LT-2" },
    });
    await waitFor(() => expect(copy()).toBeDisabled());
    expect(
      screen.getByText("Save first to copy your changes."),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByRole("textbox", { name: "Room 1 room" }), {
      target: { value: "LT-1" },
    });
    await waitFor(() => expect(copy()).toBeEnabled());
  });

  it("asks before a filter change drops unsaved changes", async () => {
    await openCourse();
    const roomName = () => screen.getByRole("textbox", { name: "Room 1 room" });
    fireEvent.change(roomName(), { target: { value: "LT-2" } });
    await waitFor(() => expect(roomName()).toHaveValue("LT-2"));

    await pick("Exam", "End Sem");
    expect(
      await screen.findByText("Discard unsaved changes?"),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Keep editing" }));
    await waitFor(() =>
      expect(screen.queryByText("Discard unsaved changes?")).toBeNull(),
    );
    expect(screen.getByRole("textbox", { name: "Exam" })).toHaveValue(
      "Mid Sem",
    );
    expect(roomName()).toHaveValue("LT-2");
    const loads = () =>
      axios.get.mock.calls.filter(([url]) => url === attendanceSheetRoute);
    expect(loads()).toHaveLength(1);

    sheet = sheetBody({ exam: "END", plan: null });
    await pick("Exam", "End Sem");
    await screen.findByText("Discard unsaved changes?");
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Discard" }));
    });
    await waitFor(() => expect(loads()).toHaveLength(2));
    expect(loads()[1][1].params.exam).toBe("END");
    expect(screen.getByRole("textbox", { name: "Exam" })).toHaveValue(
      "End Sem",
    );
    expect(await screen.findByText("Not saved yet.")).toBeInTheDocument();
  });

  it("asks before a course change drops unsaved changes", async () => {
    await openCourse();
    fireEvent.change(screen.getByRole("textbox", { name: "Room 1 room" }), {
      target: { value: "LT-2" },
    });
    await pick("Course", "CS1001 - Programming");
    await screen.findByText("Discard unsaved changes?");
    fireEvent.click(screen.getByRole("button", { name: "Keep editing" }));
    await waitFor(() =>
      expect(screen.queryByText("Discard unsaved changes?")).toBeNull(),
    );
    expect(screen.getByRole("textbox", { name: "Course" })).toHaveValue(
      "CS8004 - Machine Learning (Mid Sem saved)",
    );
    expect(screen.getByText("23BCS001")).toBeInTheDocument();
  });

  it("switches without asking when nothing changed", async () => {
    await openCourse();
    await pick("Exam", "End Sem");
    expect(screen.queryByText("Discard unsaved changes?")).toBeNull();
    expect(screen.getByRole("textbox", { name: "Exam" })).toHaveValue(
      "End Sem",
    );
  });

  it("previews a plan whose range now runs past a shorter roll list", async () => {
    sheet = sheetBody({
      plan: { ...PLAN, roll_count: 46, rooms: [{ ...ROOM, to_sno: 46 }] },
    });
    await openCourse();
    expect(
      screen.getByText("Roll list was 46 when saved, now 45."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Room 1 goes past S.No 45, the last on the roll list."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Room 1: S.No must be between 1 and 45."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeDisabled();
    const preview = screen.getByRole("button", { name: "Preview" });
    expect(preview).toBeEnabled();
    fireEvent.click(preview);
    await screen.findByTitle("Attendance sheet preview");
    const [sheets] = renderAttendancePdf.mock.calls.at(-1);
    expect(sheets).toHaveLength(1);
    expect(sheets[0].total).toBe(45);
  });

  it("caps the room name and instructor text at their saved sizes", async () => {
    await openCourse();
    expect(
      screen.getByRole("textbox", { name: "Room 1 room" }),
    ).toHaveAttribute("maxlength", "30");
    expect(
      screen.getByRole("textbox", { name: "Room 1 instructors" }),
    ).toHaveAttribute("maxlength", "500");
  });

  it("says when it was saved even if the saving user is gone", async () => {
    sheet = sheetBody({ plan: { ...PLAN, updated_by: null } });
    await openCourse();
    expect(
      screen.getByText(
        `Saved ${new Date(PLAN.updated_at).toLocaleString("en-IN")}`,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Saved by/)).toBeNull();
  });

  it("shows the course picked last when an earlier answer arrives late", async () => {
    let answerFirst;
    axios.get.mockImplementation((url, { params }) => {
      if (url === attendanceSheetCoursesRoute) {
        return Promise.resolve({ data: COURSES });
      }
      if (params.course === "7") {
        return new Promise((resolve) => {
          answerFirst = resolve;
        });
      }
      return Promise.resolve({
        data: sheetBody({ course: PROGRAMMING, prefix: "23BEC", plan: null }),
      });
    });
    await pick("Course", "CS8004 - Machine Learning (Mid Sem saved)");
    await pick("Course", "CS1001 - Programming");
    await screen.findByText("23BEC001");

    await act(async () => {
      answerFirst({ data: sheetBody() });
    });
    expect(screen.getByText("23BEC001")).toBeInTheDocument();
    expect(screen.queryByText("23BCS001")).toBeNull();
    expect(screen.queryByText(/^Saved by/)).toBeNull();
  });

  it("frees the PDF when the course changes and when the page closes", async () => {
    axios.get.mockImplementation((url, { params }) =>
      Promise.resolve({
        data:
          url === attendanceSheetCoursesRoute
            ? COURSES
            : params.course === "7"
              ? sheet
              : sheetBody({ course: PROGRAMMING, prefix: "23BEC" }),
      }),
    );
    await openCourse();
    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    await screen.findByTitle("Attendance sheet preview");

    await pick("Course", "CS1001 - Programming");
    await screen.findByText("23BEC001");
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:pdf-1");
    expect(screen.queryByTitle("Attendance sheet preview")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Preview" }));
    await screen.findByTitle("Attendance sheet preview");
    expect(URL.revokeObjectURL).not.toHaveBeenCalledWith("blob:pdf-2");
    view.unmount();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:pdf-2");
  });

  it("reloads the plan after someone else saved first", async () => {
    await openCourse();
    axios.post.mockRejectedValueOnce({
      response: {
        status: 409,
        data: { detail: "Someone saved this plan after you opened it." },
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await screen.findByText("Someone saved this plan after you opened it.");

    const newer = "2026-11-23T12:00:00+05:30";
    sheet = sheetBody({
      plan: {
        ...PLAN,
        updated_at: newer,
        updated_by: "acadug",
        rooms: [{ ...ROOM, room: "LT-9" }],
      },
    });
    const loads = () =>
      axios.get.mock.calls.filter(([url]) => url === attendanceSheetRoute)
        .length;
    expect(loads()).toBe(1);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Reload" }));
    });
    expect(loads()).toBe(2);
    expect(
      await screen.findByRole("textbox", { name: "Room 1 room" }),
    ).toHaveValue("LT-9");
    expect(
      screen.queryByText("Someone saved this plan after you opened it."),
    ).toBeNull();

    axios.post.mockResolvedValueOnce({ data: sheet });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(2));
    const body = axios.post.mock.calls[1][1];
    expect(body.updated_at).toBe(newer);
    expect(body.rooms[0].room).toBe("LT-9");
    await screen.findByText(
      `Saved by acadug, ${new Date(newer).toLocaleString("en-IN")}`,
    );
  });

  it("offers to reload when the course fails to load", async () => {
    axios.get.mockImplementation((url) =>
      url === attendanceSheetCoursesRoute
        ? Promise.resolve({ data: COURSES })
        : Promise.reject(new Error("Network Error")),
    );
    await pick("Course", "CS8004 - Machine Learning (Mid Sem saved)");
    await screen.findByText("Could not load this course.");

    axios.get.mockImplementation((url) =>
      Promise.resolve({
        data: url === attendanceSheetCoursesRoute ? COURSES : sheet,
      }),
    );
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Reload" }));
    });
    expect(await screen.findByText("23BCS001")).toBeInTheDocument();
    expect(screen.queryByText("Could not load this course.")).toBeNull();
  });
});

describe("Exam attendance sheet menu entry", () => {
  it("offers the page to acadadmin and programme admins only", () => {
    const page = EXAMINATION_PAGES.find((p) => p.key === "examAttendanceSheet");
    expect(page).toMatchObject({
      slug: "attendance-sheet",
      title: "Exam Attendance Sheet",
      icon: "ClipboardText",
      group: null,
    });
    expect(page.roles).toEqual([
      "acadadmin",
      "Acad UG",
      "Acad PG",
      "Acad Ph.D.",
    ]);
  });
});
