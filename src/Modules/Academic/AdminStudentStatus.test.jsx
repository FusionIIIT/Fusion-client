import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminStudentStatus from "./AdminStudentStatus";
import {
  readmitStudentRoute,
  studentStatusRoute,
  withdrawStudentRoute,
} from "../../routes/academicRoutes";
import { theme } from "../../ui/theme/theme";

vi.mock("axios", () => ({ default: { get: vi.fn(), post: vi.fn() } }));

const NO_BLOCKERS = {
  ungraded: [],
  unverified: [],
  pre_registration: [],
  final_registration: [],
};

const record = (status, history = []) => ({
  roll_no: "23BEC020",
  name: "Asha Rao",
  discipline: "B.Tech ECE",
  batch: 2023,
  semester: 4,
  status,
  blockers: NO_BLOCKERS,
  history,
});

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
          blockers: {
            ungraded: ["EC4001"],
            pre_registration: [5],
            final_registration: [5],
          },
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
      screen.getByText("Courses without a grade: EC4001"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Pre-registration choices: semester 5"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Final registration not verified: semester 5"),
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
          ...NO_BLOCKERS,
          unverified: ["EC4001"],
          pre_registration: [5],
        },
      },
    });
    await lookUp();
    expect(
      screen.getByText("Grades not yet verified: EC4001"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Pre-registration choices: semester 5"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Withdraw" })).toBeDisabled();
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
});
