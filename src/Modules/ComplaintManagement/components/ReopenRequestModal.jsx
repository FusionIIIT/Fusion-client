import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Group,
  Modal,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

export default function ReopenRequestModal({
  opened,
  onClose,
  complaint,
  reopenDeadline = "",
  onRequestReopen,
  isLoading = false,
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (opened) {
      setReason("");
      setError("");
    }
  }, [opened]);

  const handleSubmit = async () => {
    const trimmedReason = reason.trim();
    if (!trimmedReason) {
      setError("A justification is required to request reopen.");
      return;
    }

    setError("");
    await onRequestReopen({ reopen_reason: trimmedReason });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Request Reopen"
      centered
      size="md"
    >
      <Stack gap="md">
        {complaint && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="orange"
            title="Reopen Request"
          >
            Complaint #{complaint.id} - {complaint.complaint_type}
          </Alert>
        )}

        {reopenDeadline && (
          <Text size="sm" c="dimmed">
            Reopen window closes on {new Date(reopenDeadline).toLocaleString()}.
          </Text>
        )}

        <div>
          <Text fw={500} mb="xs" size="sm">
            Justification
          </Text>
          <Textarea
            placeholder="Explain why this complaint should be reopened..."
            minRows={4}
            maxRows={6}
            value={reason}
            onChange={(event) => {
              setReason(event.currentTarget.value);
              if (error && event.currentTarget.value.trim()) {
                setError("");
              }
            }}
            maxLength={300}
            disabled={isLoading}
            error={error}
          />
          <Text size="xs" c="dimmed" mt="xs">
            {reason.trim().length}/300 characters
          </Text>
        </div>

        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button color="orange" onClick={handleSubmit} loading={isLoading}>
            Submit Reopen Request
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

ReopenRequestModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  complaint: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    complaint_type: PropTypes.string,
  }),
  reopenDeadline: PropTypes.string,
  onRequestReopen: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

ReopenRequestModal.defaultProps = {
  complaint: null,
  reopenDeadline: "",
  isLoading: false,
};
