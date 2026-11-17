import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DeletePreRegistration from "./DeletePreRegistration";
import {
  deletePreRegistrationRoute,
  searchPreRegistrationRoute,
} from "../../routes/academicRoutes";
import { theme } from "../../ui/theme/theme";

vi.mock("axios", () => ({ default: { post: vi.fn() } }));

const CHOICE = {
  course_id: { name: "Design Studio" },
  semester_id: { semester_no: 6 },
  course_slot_id: { name: "DS6" },
  registration_type: "Regular",
  priority: 1,
};

function search(roll, semester) {
  render(
    <MantineProvider theme={theme}>
      <DeletePreRegistration />
    </MantineProvider>,
  );
  fireEvent.change(screen.getByLabelText("Roll No:"), {
    target: { value: roll },
  });
  fireEvent.change(screen.getByLabelText("Semester:"), {
    target: { value: semester },
  });
  fireEvent.click(screen.getByRole("button", { name: "Search" }));
}

describe("DeletePreRegistration", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "token"),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
    vi.stubGlobal("alert", vi.fn());
    axios.post.mockReset();
  });

  it("finds and deletes choices saved by a submission that never finished", async () => {
    axios.post.mockResolvedValueOnce({
      data: {
        initial_registration: [CHOICE],
        student_registration_check: null,
      },
    });
    search(" 24bds049 ", "6");

    // The table renders once for wide screens and once as cards for narrow ones.
    expect(await screen.findAllByText("Design Studio")).not.toHaveLength(0);
    expect(screen.getByText(/submission did not finish/)).toBeInTheDocument();
    expect(axios.post).toHaveBeenCalledWith(
      searchPreRegistrationRoute,
      { roll_no: "24BDS049", sem_no: "6" },
      expect.anything(),
    );

    axios.post.mockResolvedValueOnce({
      data: { message: "Successfully Deleted." },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Delete Pre-Registration" }),
    );
    fireEvent.click(
      await screen.findByRole("button", { name: /Confirm Delete/ }),
    );

    await waitFor(() =>
      expect(axios.post).toHaveBeenLastCalledWith(
        deletePreRegistrationRoute,
        { roll_no: "24BDS049", sem_no: "6" },
        expect.anything(),
      ),
    );
  });

  it("says nothing was found when there are no choices and no record", async () => {
    axios.post.mockResolvedValueOnce({
      data: { initial_registration: [], student_registration_check: null },
    });
    search("24BDS049", "6");

    expect(
      await screen.findByText("No Registration Found!"),
    ).toBeInTheDocument();
  });
});
