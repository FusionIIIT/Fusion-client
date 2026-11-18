import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen } from "@testing-library/react";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PreRegistration from "./PreRegistration";
import { theme } from "../../ui/theme/theme";

vi.mock("axios", () => ({ default: { get: vi.fn(), post: vi.fn() } }));

const CORE = {
  sno: 1,
  slot_name: "DS4",
  slot_type: "Design",
  semester: 4,
  course_choices: [
    { id: 11, code: "DS2001", name: "Design Studio", credits: 4 },
  ],
};

function backlogSlot(prevRegistrations) {
  return {
    sno: 2,
    slot_name: "BL1",
    slot_type: "Backlog",
    semester: 4,
    course_choices: [{ id: 21, code: "DS1001", name: "Sketching", credits: 4 }],
    prev_registrations: prevRegistrations,
  };
}

const FAILED = {
  id: 501,
  course_id: { code: "DS1001", name: "Sketching" },
  semester_id: { semester_no: 2 },
  grade: "F",
  repeat_as: "Backlog",
};

function renderPage(slots) {
  axios.get.mockResolvedValueOnce({ data: slots });
  render(
    <MantineProvider theme={theme}>
      <PreRegistration />
    </MantineProvider>,
  );
}

describe("PreRegistration backlog slots", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "token"),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    axios.get.mockReset();
  });

  it("shows each course that can be repeated with its grade and how", async () => {
    renderPage([CORE, backlogSlot([FAILED])]);

    // Mantine labels both the input and its option list.
    const [input] = await screen.findAllByLabelText(
      "Previous registration for BL1",
    );
    fireEvent.click(input);

    expect(
      await screen.findByText(/Sketching · Semester 2 · Grade F → Backlog/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Only your latest attempt/)).toBeInTheDocument();
  });

  it("says so instead of offering the form when nothing can be repeated", async () => {
    renderPage([CORE, backlogSlot([])]);

    expect(
      await screen.findByText(/You have no course to repeat/),
    ).toBeInTheDocument();
    expect(
      screen.queryAllByLabelText("Previous registration for BL1"),
    ).toHaveLength(0);
    expect(screen.queryAllByLabelText("Backlog course for BL1")).toHaveLength(
      0,
    );
  });
});
