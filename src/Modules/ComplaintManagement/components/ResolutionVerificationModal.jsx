import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Group,
  Modal,
  Select,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

const DECISION_OPTIONS = [
  { value: "approve", label: "Verify and Close" },
  { value: "reject", label: "Reject Resolution" },
];

export default function ResolutionVerificationModal({
  opened,
  onClose,
  complaint,
  defaultDecision = "approve",
  verificationSource = "complainant",
  onVerify,
  isLoading = false,
}) {
  const [decision, setDecision] = useState(defaultDecision);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (opened) {
      setDecision(defaultDecision);
      setNotes("");
      setError("");
    }
  }, [opened, defaultDecision]);

  const handleSubmit = async () => {
    const trimmedNotes = notes.trim();
    if (decision === "reject" && !trimmedNotes) {
      setError("A reason is required when rejecting the resolution.");
      return;
    }

    setError("");
    await onVerify({
      verification_source: verificationSource,
      verification_decision: decision,
      verification_notes: trimmedNotes,
    });
    setNotes("");
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Resolution Verification"
      centered
      size="md"
    >
      <Stack gap="md">
        {complaint && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="green"
            title="Verify the resolved complaint"
          >
            Complaint #{complaint.id} - {complaint.complaint_type}
          </Alert>
        )}

        <div>
          <Text fw={500} mb="xs" size="sm">
            Decision
          </Text>
          <Select
            data={DECISION_OPTIONS}
            value={decision}
            onChange={(value) => setDecision(value || "approve")}
            disabled={isLoading}
          />
        </div>

        <div>
          <Text fw={500} mb="xs" size="sm">
            Comment or reason
          </Text>
          <Textarea
            placeholder="Add context for your decision..."
            minRows={3}
            maxRows={5}
            value={notes}
            onChange={(event) => {
              setNotes(event.currentTarget.value);
              if (error && event.currentTarget.value.trim()) {
                setError("");
              }
            }}
            maxLength={300}
            disabled={isLoading}
            error={error}
          />
          <Text size="xs" c="dimmed" mt="xs">
            {notes.trim().length}/300 characters
          </Text>
        </div>

        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button color="green" onClick={handleSubmit} loading={isLoading}>
            Submit Decision
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

ResolutionVerificationModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  complaint: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    complaint_type: PropTypes.string,
  }),
  defaultDecision: PropTypes.oneOf(["approve", "reject"]),
  verificationSource: PropTypes.oneOf(["complainant", "supervisor"]),
  onVerify: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

ResolutionVerificationModal.defaultProps = {
  complaint: null,
  defaultDecision: "approve",
  verificationSource: "complainant",
  isLoading: false,
};
