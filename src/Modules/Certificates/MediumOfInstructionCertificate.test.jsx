import { MantineProvider } from "@mantine/core";
import { fireEvent, render, screen } from "@testing-library/react";
import axios from "axios";
import { describe, expect, it, vi } from "vitest";

import MediumOfInstructionCertificate from "./MediumOfInstructionCertificate";
import { theme } from "../../ui/theme/theme";

vi.mock("axios", () => ({ default: { get: vi.fn(), post: vi.fn() } }));

const student = (verb) => ({
  salutation: "Ms.",
  name: "Asha Rao",
  roll_number: "21BCS032",
  relation: "D/o",
  father_name: "Ravi Rao",
  year_ordinal: "4th",
  semester_ordinal: "8th",
  programme: "B.Tech",
  programme_short: "B.Tech.",
  discipline: "Computer Science and Engineering",
  is_ready: true,
  validation_errors: [],
  verb,
});

async function previewFor(verb) {
  axios.get.mockResolvedValueOnce({
    data: {
      student: student(verb),
      certificate: {
        signatory_name: "Registrar",
        signatory_title: "Registrar",
        issued_on: "22.11.2026",
        reference_preview: "IIITDMJ/2026/11/21BCS032/001",
      },
    },
  });
  render(
    <MantineProvider theme={theme}>
      <MediumOfInstructionCertificate />
    </MantineProvider>,
  );
  fireEvent.change(screen.getByLabelText("Roll number"), {
    target: { value: "21bcs032" },
  });
  fireEvent.click(
    screen.getByRole("button", { name: /fetch student details/i }),
  );
  fireEvent.click(await screen.findByRole("button", { name: /preview/i }));
  return screen.findByText(/a student of/);
}

describe("Medium of Instruction preview", () => {
  it("says the student is studying", async () => {
    expect((await previewFor("is")).textContent).toMatch(/is a student of/);
  });

  it("says an alumnus was a student", async () => {
    expect((await previewFor("was")).textContent).toMatch(/was a student of/);
  });
});
