import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen } from "@testing-library/react";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CheckResult from "./checkResult";
import { theme } from "../../ui/theme/theme";

vi.mock("axios", () => ({ default: { get: vi.fn(), post: vi.fn() } }));

const semesters = [
  { semester_no: 6, semester_type: "Even Semester", label: "Semester 6" },
  { semester_no: 3, semester_type: "Odd Semester", label: "Semester 3" },
];

const resultFor = (semesterNo) => ({
  data: {
    success: true,
    courses: [
      {
        coursecode: `CODE${semesterNo}`,
        coursename: `Course of semester ${semesterNo}`,
        credits: 3,
        grade: "A",
        points: 9,
      },
    ],
    spi: "9.0",
    cpi: "8.5",
    su: 3,
    tu: 90,
    student_info: { name: "Test Student", roll_number: "23BCS001" },
  },
});

async function choose(option) {
  fireEvent.click(screen.getByRole("textbox", { name: /semester/i }));
  fireEvent.click(await screen.findByRole("option", { name: option }));
}

async function renderPage() {
  axios.get.mockResolvedValueOnce({ data: { success: true, semesters } });
  render(
    <MantineProvider theme={theme}>
      <CheckResult />
    </MantineProvider>,
  );
  await vi.waitFor(() => expect(axios.get).toHaveBeenCalled());
}

const semesterLine = () => screen.getByText("Semester:").parentElement;

describe("My Result", () => {
  beforeEach(() => {
    axios.get.mockReset();
    axios.post.mockReset();
    // jsdom has no scrollIntoView, which the Select dropdown calls.
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("does not show semester 6 grades under semester 3 when only the dropdown changes", async () => {
    await renderPage();
    axios.post.mockResolvedValueOnce(resultFor(6));
    await choose("Semester 6");
    fireEvent.click(screen.getByRole("button", { name: "View Result" }));
    expect(await screen.findByText("Course of semester 6")).toBeInTheDocument();
    expect(semesterLine().textContent).toBe("Semester: 6");

    await choose("Semester 3");

    expect(screen.queryByText("Course of semester 6")).not.toBeInTheDocument();
    expect(screen.queryByText("Semester:")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Download PDF" }),
    ).not.toBeInTheDocument();
  });

  it("labels the report with the semester that was fetched, even if the dropdown moved while loading", async () => {
    await renderPage();
    let answer;
    axios.post.mockReturnValueOnce(
      new Promise((resolve) => {
        answer = resolve;
      }),
    );
    await choose("Semester 6");
    fireEvent.click(screen.getByRole("button", { name: "View Result" }));
    await choose("Semester 3");
    answer(resultFor(6));

    expect(await screen.findByText("Course of semester 6")).toBeInTheDocument();
    expect(semesterLine().textContent).toBe("Semester: 6");
  });

  it("asks for the PDF of the semester that is on screen", async () => {
    await renderPage();
    let answer;
    axios.post.mockReturnValueOnce(
      new Promise((resolve) => {
        answer = resolve;
      }),
    );
    await choose("Semester 6");
    fireEvent.click(screen.getByRole("button", { name: "View Result" }));
    await choose("Semester 3");
    answer(resultFor(6));
    await screen.findByText("Course of semester 6");

    axios.post.mockResolvedValueOnce({ data: new Blob(["%PDF"]) });
    window.URL.createObjectURL = vi.fn(() => "blob:x");
    window.URL.revokeObjectURL = vi.fn();
    // jsdom cannot follow the download link the page clicks.
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    fireEvent.click(screen.getByRole("button", { name: "Download PDF" }));

    await vi.waitFor(() => expect(axios.post).toHaveBeenCalledTimes(2));
    const body = axios.post.mock.calls[1][1];
    expect(body.semester_no).toBe(6);
    expect(body.semester_type).toBe("Even Semester");
    expect(body.courses[0].coursecode).toBe("CODE6");
  });
});
