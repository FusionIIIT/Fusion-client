import PropTypes from "prop-types";
import { useState } from "react";
import {
  Modal,
  Stack,
  Textarea,
  Button,
  Group,
  Text,
  Select,
  Alert,
  Divider,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

const STATUS_OPTIONS = [
  { value: "0", label: "Pending" },
  { value: "1", label: "In Progress" },
  { value: "2", label: "Completed" },
];

export default function ResolutionModal({
  opened,
  onClose,
  complaint,
  onResolve,
  isLoading = false,
}) {
  const [newStatus, setNewStatus] = useState(null);
  const [remarks, setRemarks] = useState("");

  const handleResolve = () => {
    onResolve({
      status: Number(newStatus),
      remarks,
    });
    setNewStatus(null);
    setRemarks("");
  };

  const handleClose = () => {
    setNewStatus(null);
    setRemarks("");
    onClose();
  };

  const currentStatusLabel =
    STATUS_OPTIONS.find((s) => s.value === String(complaint?.status))?.label ||
    "Unknown";

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Update Complaint Status"
      centered
      size="md"
    >
      <Stack gap="md">
        {complaint && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="blue"
            title="Current Status"
          >
            Complaint #{complaint.id} - <strong>{currentStatusLabel}</strong>
          </Alert>
        )}

        <div>
          <Text fw={500} mb="xs" size="sm">
            Select New Status
          </Text>
          <Select
            placeholder="Choose status..."
            data={STATUS_OPTIONS}
            value={newStatus}
            onChange={setNewStatus}
            searchable
            clearable
            disabled={isLoading}
          />
        </div>

        <Divider />

        <div>
          <Text fw={500} mb="xs" size="sm">
            Remarks
          </Text>
          <Textarea
            placeholder="Add your remarks here..."
            minRows={3}
            maxRows={5}
            value={remarks}
            onChange={(e) => setRemarks(e.currentTarget.value)}
            maxLength={300}
            disabled={isLoading}
          />
          <Text size="xs" c="dimmed" mt="xs">
            {remarks.length}/300 characters
          </Text>
        </div>

        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            color="blue"
            onClick={handleResolve}
            loading={isLoading}
            disabled={!newStatus || !remarks.trim()}
          >
            Update Status
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

ResolutionModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  complaint: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    status: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
  onResolve: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

ResolutionModal.defaultProps = {
  complaint: null,
  isLoading: false,
};
