import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

const STATUS_OPTIONS = [
  { value: "1", label: "In Progress" },
  { value: "2", label: "Resolved" },
];

const initialForm = {
  assigned_to: "",
  assigned_team: "",
  remarks: "",
  status: "1",
  progress_notes: "",
  estimated_resolution_time: "",
};

export default function ComplaintBulkActionModal({
  opened,
  mode,
  selectedCount,
  workers,
  onClose,
  onSubmit,
  isLoading = false,
}) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (opened) {
      setForm(initialForm);
      setError("");
    }
  }, [opened, mode]);

  const workerOptions = useMemo(
    () =>
      workers.map((worker) => ({
        value: String(worker.id),
        label: `${worker.name || `Worker ${worker.id}`} (${worker.worker_type || "general"})`,
      })),
    [workers],
  );

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) {
      setError("");
    }
  };

  const handleSubmit = () => {
    if (mode === "reassign") {
      if (!form.assigned_to) {
        setError("Select a worker to reassign the complaint batch.");
        return;
      }
      onSubmit({
        assigned_to: form.assigned_to,
        assigned_team: form.assigned_team,
        remarks: form.remarks,
      });
      return;
    }

    if (!form.status) {
      setError("Select the intervention status.");
      return;
    }

    if (!form.remarks.trim()) {
      setError("Remarks are required for intervention actions.");
      return;
    }

    onSubmit({
      status: Number(form.status),
      remarks: form.remarks,
      progress_notes: form.progress_notes || form.remarks,
      estimated_resolution_time: form.estimated_resolution_time || null,
    });
  };

  let title = "Bulk Intervention";
  if (mode === "reassign") {
    title = "Bulk Reassign Complaints";
  }
  const helperText =
    mode === "reassign"
      ? "Assign the selected complaints to a new worker and optionally add a team note."
      : "Move the selected complaints forward with one status update and shared remarks.";

  return (
    <Modal opened={opened} onClose={onClose} title={title} centered size="md">
      <Stack gap="md">
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="blue"
          variant="light"
        >
          {selectedCount} complaint{selectedCount === 1 ? "" : "s"} selected.
        </Alert>

        <Text size="sm" c="dimmed">
          {helperText}
        </Text>

        {mode === "reassign" ? (
          <>
            <Select
              label="Assign to Worker"
              placeholder="Select a worker"
              data={workerOptions}
              value={form.assigned_to}
              onChange={(value) => handleChange("assigned_to", value || "")}
              searchable
              clearable
              error={error}
            />
            <TextInput
              label="Assigned Team"
              placeholder="Optional team or group name"
              value={form.assigned_team}
              onChange={(event) =>
                handleChange("assigned_team", event.currentTarget.value)
              }
            />
            <Textarea
              label="Internal Note"
              placeholder="Optional note for the reassignment"
              minRows={3}
              value={form.remarks}
              onChange={(event) =>
                handleChange("remarks", event.currentTarget.value)
              }
            />
          </>
        ) : (
          <>
            <Select
              label="Intervention Status"
              data={STATUS_OPTIONS}
              value={form.status}
              onChange={(value) => handleChange("status", value || "")}
              error={error && !form.status ? error : undefined}
            />
            <Textarea
              label="Remarks"
              placeholder="Shared remarks for the selected complaints"
              minRows={3}
              value={form.remarks}
              onChange={(event) =>
                handleChange("remarks", event.currentTarget.value)
              }
              error={error && !form.remarks.trim() ? error : undefined}
            />
            <Textarea
              label="Progress Notes"
              placeholder="Optional more detailed progress notes"
              minRows={3}
              value={form.progress_notes}
              onChange={(event) =>
                handleChange("progress_notes", event.currentTarget.value)
              }
            />
            <TextInput
              type="datetime-local"
              label="Estimated Resolution Time"
              value={form.estimated_resolution_time}
              onChange={(event) =>
                handleChange(
                  "estimated_resolution_time",
                  event.currentTarget.value,
                )
              }
            />
          </>
        )}

        {error && (
          <Text size="sm" c="red">
            {error}
          </Text>
        )}

        <Group justify="flex-end">
          <Button variant="default" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={isLoading}>
            {mode === "reassign" ? "Reassign Complaints" : "Apply Intervention"}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

ComplaintBulkActionModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(["reassign", "intervene"]).isRequired,
  selectedCount: PropTypes.number.isRequired,
  workers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      name: PropTypes.string,
      worker_type: PropTypes.string,
    }),
  ),
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

ComplaintBulkActionModal.defaultProps = {
  workers: [],
  isLoading: false,
};
