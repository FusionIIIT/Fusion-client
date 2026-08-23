import { MantineProvider } from "@mantine/core";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ConfirmDialog from "./ConfirmDialog";
import { theme } from "../ui/theme/theme";

const setup = ({ title, confirmLabel } = {}) => {
  const onCancel = vi.fn();
  const onConfirm = vi.fn();
  render(
    <MantineProvider theme={theme}>
      <ConfirmDialog
        opened
        onCancel={onCancel}
        onConfirm={onConfirm}
        message="Are you sure you want to remove this course slot?"
        title={title}
        confirmLabel={confirmLabel}
      />
    </MantineProvider>,
  );
  return { onCancel, onConfirm };
};

describe("ConfirmDialog", () => {
  it("states what is about to happen", () => {
    setup();
    expect(
      screen.getByText("Are you sure you want to remove this course slot?"),
    ).toBeInTheDocument();
    expect(screen.getByText("Warning")).toBeInTheDocument();
  });

  it("confirms only when the confirm button is pressed", async () => {
    const { onCancel, onConfirm } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("cancels from the cancel button and from the close button", async () => {
    const { onCancel, onConfirm } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await userEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(onCancel).toHaveBeenCalledTimes(2);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("renders nothing while closed", () => {
    render(
      <MantineProvider theme={theme}>
        <ConfirmDialog
          opened={false}
          onCancel={vi.fn()}
          onConfirm={vi.fn()}
          message="hidden"
        />
      </MantineProvider>,
    );
    expect(screen.queryByText("hidden")).not.toBeInTheDocument();
  });

  it("takes custom labels for actions that are not removals", () => {
    setup({ title: "Discard changes", confirmLabel: "Discard" });
    expect(screen.getByText("Discard changes")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Discard" })).toBeInTheDocument();
  });
});
