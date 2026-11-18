import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import HODReviewModal from "./HODReviewModal";
import DeanReviewModal from "./DeanReviewModal";
import { theme } from "../../ui/theme/theme";

vi.mock("axios", () => ({ default: { get: vi.fn(), post: vi.fn() } }));

const topic = (status, extra = {}) => ({
  id: 7,
  student_roll: "25MCS001",
  student_name: "Test Student",
  student_discipline: "CSE",
  category: "Regular",
  broad_area: "Machine learning",
  research_theme: "Graph learning",
  external: {
    ext_name: "",
    ext_email: "",
    ext_discipline: "",
    ext_institution: "",
  },
  load: { pg_single: 1, pg_shared: 0, phd_single: 0, phd_shared: 0 },
  committee: [{ id: "f1", name: "Prof A", discipline: "CSE" }],
  status,
  hod_remarks: "",
  dean_remarks: "",
  ...extra,
});

function open(Modal, data) {
  axios.get.mockResolvedValue({ data });
  axios.post.mockResolvedValue({ data: { status: "ok" } });
  const refresh = vi.fn();
  render(
    <MantineProvider theme={theme}>
      <Modal thesis={{ id: 7 }} onClose={vi.fn()} refresh={refresh} />
    </MantineProvider>,
  );
  return refresh;
}

beforeEach(() => {
  localStorage.setItem("authToken", "t");
});

afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("HODReviewModal", () => {
  it("lets the HOD act on a topic the Dean sent back, showing the Dean's remarks", async () => {
    const refresh = open(
      HODReviewModal,
      topic("dean_rejected", { dean_remarks: "Narrow the scope." }),
    );

    expect(await screen.findByText("Narrow the scope.")).toBeInTheDocument();
    expect(screen.getByText("Sent back by Dean Academic.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Approve" })).toBeEnabled();
    fireEvent.change(
      screen.getByLabelText("Remarks (if sending back to supervisor)"),
      { target: { value: "Revise as the Dean asked." } },
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Send Back to Supervisor" }),
    );

    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/hod/thesis/7/review/"),
      { approve: false, remarks: "Revise as the Dean asked." },
      expect.anything(),
    );
  });

  it("says a topic came back from the Dean even without remarks", async () => {
    open(HODReviewModal, topic("dean_rejected"));

    expect(
      await screen.findByText("Sent back by Dean Academic."),
    ).toBeInTheDocument();
    expect(screen.getByText("No remarks were given.")).toBeInTheDocument();
  });

  it("still acts on a topic the supervisor forwarded", async () => {
    open(HODReviewModal, topic("hod_pending"));

    expect(
      await screen.findByRole("button", { name: "Approve" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Sent back by Dean Academic."),
    ).not.toBeInTheDocument();
  });

  it.each(["hod_rejected", "hod_approved", "dean_approved"])(
    "shows no actions once the topic is %s",
    async (status) => {
      open(HODReviewModal, topic(status));

      expect(await screen.findByText("Graph learning")).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Approve" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText("Remarks (if sending back to supervisor)"),
      ).not.toBeInTheDocument();
    },
  );
});

describe("DeanReviewModal", () => {
  it("gives the Dean a remarks box when sending an HOD-approved topic back", async () => {
    const refresh = open(DeanReviewModal, topic("hod_approved"));

    fireEvent.change(
      await screen.findByLabelText("Remarks (if sending back to HOD)"),
      { target: { value: "Narrow the scope." } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Send Back to HOD" }));

    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/dean/thesis/7/review/"),
      { approve: false, remarks: "Narrow the scope." },
      expect.anything(),
    );
  });

  it("shows no actions on a topic it already sent back", async () => {
    open(DeanReviewModal, topic("dean_rejected", { dean_remarks: "x" }));

    expect(await screen.findByText("Graph learning")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Send Back to HOD" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("Remarks (if sending back to HOD)"),
    ).not.toBeInTheDocument();
  });
});
