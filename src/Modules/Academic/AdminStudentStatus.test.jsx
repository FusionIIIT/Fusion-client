import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminStudentStatus from "./AdminStudentStatus";
import {
  cancelSemesterDropRoute,
  readmitStudentRoute,
  recordSemesterDropRoute,
  studentStatusRoute,
  withdrawStudentRoute,
} from "../../routes/academicRoutes";
import { theme } from "../../ui/theme/theme";

vi.mock("axios", () => ({ default: { get: vi.fn(), post: vi.fn() } }));

const NO_BLOCKERS = { ungraded: [], unverified: [] };
const NOTHING_TO_REMOVE = { pre_registration: [], final_registration: [] };
const EC4001 = { code: "EC4001", semester: 4, session: "2024-25" };

const record = (status, history = [], drops = []) => ({
  roll_no: "23BEC020",
  name: "Asha Rao",
  discipline: "B.Tech ECE",
  batch: 2023,
  semester: 4,
  status,
  blockers: NO_BLOCKERS,
  withdrawal_removes: NOTHING_TO_REMOVE,
  history,
  semesters: [1, 2, 3, 4, 5, 6, 7, 8],
  drops,
});

const LIVE_DROP = {
  id: 7,
  semester_no: 5,
  academic_year: "2025-26",
  reason: "Medical leave",
  recorded_by: "skjain",
  recorded_at: "2026-11-22T10:00:00+05:30",
  cancelled_by: null,
  cancelled_at: null,
  cancel_reason: "",
};

const WITHDRAWN_ENTRY = {
  action: "withdraw",
  previous_status: "PRESENT",
  new_status: "WITHDRAWN",
  reason: "Left for a job",
  semester_no: 4,
  performed_by: "skjain",
  created_at: "2026-11-22T10:00:00+05:30",
};

const HEADERS = { headers: { Authorization: "Token token" } };

async function lookUp() {
  fireEvent.change(screen.getByRole("textbox", { name: "Roll number" }), {
    target: { value: "23bec020" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Look up" }));
  await screen.findByText("Asha Rao");
}

// The confirm dialog opens with a transition.
async function give(reason, button) {
  fireEvent.change(await screen.findByRole("textbox", { name: "Reason" }), {
    target: { value: reason },
  });
  fireEvent.click(screen.getByRole("button", { name: button }));
}

describe("AdminStudentStatus", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", { getItem: vi.fn(() => "token") });
    axios.get.mockReset();
    axios.post.mockReset();
    render(
      <MantineProvider theme={theme}>
        <AdminStudentStatus />
      </MantineProvider>,
    );
  });

  it("looks a student up", async () => {
    axios.get.mockResolvedValue({ data: record("PRESENT") });
    await lookUp();
    expect(axios.get).toHaveBeenCalledWith(studentStatusRoute, {
      params: { roll_no: "23BEC020" },
      ...HEADERS,
    });
    expect(
      screen.getByText("B.Tech ECE · batch 2023 · semester 4"),
    ).toBeInTheDocument();
    expect(screen.getByText("Present")).toBeInTheDocument();
    expect(screen.getByText("No changes recorded yet.")).toBeInTheDocument();
  });

  it("withdraws a present student with a reason", async () => {
    axios.get.mockResolvedValue({ data: record("PRESENT") });
    axios.post.mockResolvedValue({
      data: record("WITHDRAWN", [WITHDRAWN_ENTRY]),
    });
    await lookUp();
    fireEvent.click(screen.getByRole("button", { name: "Withdraw" }));
    await give("Left for a job", "Withdraw student");
    await screen.findByText("Left for a job");
    expect(axios.post).toHaveBeenCalledWith(
      withdrawStudentRoute,
      { roll_no: "23BEC020", reason: "Left for a job" },
      HEADERS,
    );
    // The status badge and the history row.
    expect(screen.getAllByText("Withdrawn")).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: "Re-admit" }),
    ).toBeInTheDocument();
  });

  it("does not send without a reason", async () => {
    axios.get.mockResolvedValue({ data: record("PRESENT") });
    await lookUp();
    fireEvent.click(screen.getByRole("button", { name: "Withdraw" }));
    expect(
      await screen.findByRole("button", { name: "Withdraw student" }),
    ).toBeDisabled();
  });

  it("lists what is in the way when the office must clear the semester first", async () => {
    axios.get.mockResolvedValue({ data: record("PRESENT") });
    axios.post.mockRejectedValue({
      response: {
        data: {
          detail:
            "23BEC020 still has an open semester. Remove these first, then withdraw.",
          blockers: { ungraded: [EC4001], unverified: [] },
        },
      },
    });
    await lookUp();
    fireEvent.click(screen.getByRole("button", { name: "Withdraw" }));
    await give("Left", "Withdraw student");
    expect(
      await screen.findByText(
        "23BEC020 still has an open semester. Remove these first, then withdraw.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Courses without a grade, semester 4 (2024-25): EC4001"),
    ).toBeInTheDocument();
  });

  it("re-admits a withdrawn student", async () => {
    axios.get.mockResolvedValue({
      data: record("WITHDRAWN", [WITHDRAWN_ENTRY]),
    });
    axios.post.mockResolvedValue({ data: record("PRESENT") });
    await lookUp();
    fireEvent.click(screen.getByRole("button", { name: "Re-admit" }));
    await give("Came back", "Re-admit student");
    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(
        readmitStudentRoute,
        { roll_no: "23BEC020", reason: "Came back" },
        HEADERS,
      ),
    );
    expect(await screen.findByText("Present")).toBeInTheDocument();
  });

  it("shows what is in the way as soon as the student is looked up", async () => {
    axios.get.mockResolvedValue({
      data: {
        ...record("PRESENT"),
        blockers: {
          ungraded: [],
          unverified: [
            EC4001,
            { code: "EC4002", semester: 4, session: "2024-25" },
            { code: "EC5001", semester: 5, session: "2025-26" },
          ],
        },
      },
    });
    await lookUp();
    expect(
      screen.getByText(
        "Grades not yet verified, semester 4 (2024-25): EC4001, EC4002",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Grades not yet verified, semester 5 (2025-26): EC5001"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Withdraw" })).toBeDisabled();
  });

  it("lets a student with only a stale allotment be withdrawn, saying what goes", async () => {
    axios.get.mockResolvedValue({
      data: {
        ...record("PRESENT"),
        withdrawal_removes: { pre_registration: [5], final_registration: [5] },
      },
    });
    await lookUp();
    expect(screen.queryByText(/Before withdrawing/)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Withdraw" }));
    expect(
      await screen.findByText("Withdrawing also removes:"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Course allotment never verified: semester 5"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Pre-registration choices: semester 5"),
    ).toBeInTheDocument();
  });

  it("shows the server's reason when the role is refused", async () => {
    axios.get.mockRejectedValue({
      response: {
        data: { error: "Permission denied: one of ['acadadmin'] required" },
      },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Roll number" }), {
      target: { value: "23BEC020" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Look up" }));
    expect(
      await screen.findByText(
        "Permission denied: one of ['acadadmin'] required",
      ),
    ).toBeInTheDocument();
  });

  it("offers nothing to change for an alumnus", async () => {
    axios.get.mockResolvedValue({ data: record("ALUMNI") });
    await lookUp();
    expect(screen.getByText("Alumni")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Withdraw" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Re-admit" })).toBeNull();
  });

  it("says when no semester was dropped", async () => {
    axios.get.mockResolvedValue({ data: record("PRESENT") });
    await lookUp();
    expect(screen.getByText("No semester dropped.")).toBeInTheDocument();
  });

  it("records a semester drop, the academic year following the batch", async () => {
    axios.get.mockResolvedValue({ data: record("PRESENT") });
    axios.post.mockResolvedValue({
      data: record("PRESENT", [], [LIVE_DROP]),
    });
    await lookUp();
    fireEvent.click(
      screen.getByRole("button", { name: "Record semester drop" }),
    );
    fireEvent.change(
      await screen.findByRole("combobox", { name: "Semester" }),
      { target: { value: "5" } },
    );
    expect(screen.getByRole("textbox", { name: "Academic year" })).toHaveValue(
      "2025-26",
    );
    await give("Medical leave", "Record drop");
    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(
        recordSemesterDropRoute,
        {
          roll_no: "23BEC020",
          semester_no: 5,
          academic_year: "2025-26",
          reason: "Medical leave",
        },
        HEADERS,
      ),
    );
    expect(await screen.findByText("Medical leave")).toBeInTheDocument();
    expect(screen.getByText("Dropped")).toBeInTheDocument();
  });

  it("lists what is in the way of a drop", async () => {
    axios.get.mockResolvedValue({ data: record("PRESENT") });
    axios.post.mockRejectedValue({
      response: {
        data: {
          detail:
            "Semester 5 of 23BEC020 is not empty. Clear these first, then drop it.",
          blockers: {
            registrations: ["EC5001"],
            pre_registration: true,
            final_registration: false,
          },
        },
      },
    });
    await lookUp();
    fireEvent.click(
      screen.getByRole("button", { name: "Record semester drop" }),
    );
    fireEvent.change(
      await screen.findByRole("combobox", { name: "Semester" }),
      { target: { value: "5" } },
    );
    await give("Medical leave", "Record drop");
    expect(
      await screen.findByText(
        "Semester 5 of 23BEC020 is not empty. Clear these first, then drop it.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Course registrations: EC5001"),
    ).toBeInTheDocument();
    expect(screen.getByText("Pre-registration choices")).toBeInTheDocument();
    expect(screen.queryByText("Final registration")).toBeNull();
  });

  it("cancels a drop with a reason, keeping it as cancelled", async () => {
    axios.get.mockResolvedValue({
      data: record("PRESENT", [], [LIVE_DROP]),
    });
    axios.post.mockResolvedValue({
      data: record(
        "PRESENT",
        [],
        [
          {
            ...LIVE_DROP,
            cancelled_by: "skjain",
            cancelled_at: "2026-11-23T10:00:00+05:30",
            cancel_reason: "Recorded by mistake",
          },
        ],
      ),
    });
    await lookUp();
    fireEvent.click(screen.getByRole("button", { name: "Cancel drop" }));
    await give("Recorded by mistake", "Cancel the drop");
    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(
        cancelSemesterDropRoute,
        { roll_no: "23BEC020", drop_id: 7, reason: "Recorded by mistake" },
        HEADERS,
      ),
    );
    expect(
      await screen.findByText(/Cancelled by skjain .*: Recorded by mistake/),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Cancel drop" })).toBeNull();
  });

  it("offers no drop for a withdrawn student", async () => {
    axios.get.mockResolvedValue({ data: record("WITHDRAWN") });
    await lookUp();
    expect(
      screen.queryByRole("button", { name: "Record semester drop" }),
    ).toBeNull();
  });
});
