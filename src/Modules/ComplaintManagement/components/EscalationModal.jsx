import PropTypes from "prop-types";
import {
  Modal,
  Button,
  Textarea,
  Stack,
  Group,
  Text,
  Alert,
  Divider,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { useState } from "react";

const ESCALATION_REASONS = [
  "Complaint not resolved within expected timeframe",
  "Requires supervisor expertise",
  "Recurring issue with same location",
  "Complex issue needing higher authority",
  "Complaint related to multiple departments",
];

export default function EscalationModal({
  opened,
  onClose,
  complaint,
  onEscalate,
  isLoading = false,
}) {
  const [reason, setReason] = useState("");

  const handleEscalate = async () => {
    await onEscalate({ escalation_reason: reason });
    setReason("");
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Escalate Complaint to Supervisor"
      centered
      size="md"
    >
      <Stack gap="md">
        {complaint && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="orange"
            title="Escalation Details"
          >
            Complaint #{complaint.id} - {complaint.complaint_type}
          </Alert>
        )}

        <div>
          <Text fw={500} mb="xs" size="sm">
            Reason for Escalation
          </Text>
          <Textarea
            placeholder="Explain why this needs supervisor approval..."
            minRows={3}
            maxRows={5}
            value={reason}
            onChange={(e) => setReason(e.currentTarget.value)}
            maxLength={300}
            disabled={isLoading}
          />
          <Text size="xs" c="dimmed" mt="xs">
            {reason.length}/300 characters
          </Text>
        </div>

        <Divider label="Quick reasons" labelPosition="center" />

        <div>
          <Stack gap="xs">
            {ESCALATION_REASONS.map((r, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => setReason(r)}
                disabled={isLoading}
                fullWidth
                justify="flex-start"
                style={{ textAlign: "left", fontSize: "0.85rem" }}
              >
                {r}
              </Button>
            ))}
          </Stack>
        </div>

        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={handleEscalate}
            loading={isLoading}
            disabled={!reason.trim()}
          >
            Escalate to Supervisor
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

EscalationModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  complaint: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    complaint_type: PropTypes.string,
  }),
  onEscalate: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

EscalationModal.defaultProps = {
  complaint: null,
  isLoading: false,
};
