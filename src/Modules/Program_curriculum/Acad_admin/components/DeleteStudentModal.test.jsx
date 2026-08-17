import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import DeleteStudentModal from "./DeleteStudentModal";
import { theme } from "../../../../ui/theme/theme";

const setup = ({ deleting = false } = {}) => {
  const onClose = vi.fn();
  const onConfirm = vi.fn();
  render(
    <MantineProvider theme={theme}>
      <DeleteStudentModal
        opened
        onClose={onClose}
        onConfirm={onConfirm}
        student={{ name: "ANCHAL SIDDHARTH PATIL" }}
        deleting={deleting}
      />
    </MantineProvider>,
  );
  return { onClose, onConfirm };
};

describe("DeleteStudentModal", () => {
  it("names the student and keeps both caveats", () => {
    setup();
    expect(screen.getByText(/ANCHAL SIDDHARTH PATIL/)).toBeInTheDocument();
    expect(screen.getByText(/cannot be undone/)).toBeInTheDocument();
    expect(screen.getByText(/database constraints/)).toBeInTheDocument();
    expect(screen.getByText("Confirm Delete Student")).toBeInTheDocument();
  });

  it("deletes only from the delete button", async () => {
    const { onClose, onConfirm } = setup();
    await userEvent.click(
      screen.getByRole("button", { name: "Delete Student" }),
    );
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes from cancel", async () => {
    const { onClose, onConfirm } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("shows progress while the delete is in flight", () => {
    setup({ deleting: true });
    expect(
      screen.getByRole("button", { name: "Delete Student" }),
    ).toHaveAttribute("data-loading", "true");
  });
});
