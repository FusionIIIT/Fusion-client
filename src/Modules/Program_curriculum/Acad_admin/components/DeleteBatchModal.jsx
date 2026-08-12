import PropTypes from "prop-types";
import {
  Modal,
  Stack,
  Flex,
  ThemeIcon,
  Text,
  Card,
  Alert,
  Group,
  Button,
} from "@mantine/core";
import { Trash, Warning } from "@phosphor-icons/react";

// Confirm deletion of a batch; `batch` is the resolved batch object (or null).
function DeleteBatchModal({ opened, onClose, batch, onConfirm }) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Flex align="center" gap="sm">
          <ThemeIcon color="red" size="lg">
            <Trash size={20} />
          </ThemeIcon>
          <Text size="lg" weight={600}>
            Confirm Delete Batch
          </Text>
        </Flex>
      }
      size="md"
      centered
    >
      <Stack spacing="md">
        <Text>
          Are you sure you want to delete this batch? This action cannot be
          undone.
        </Text>

        {batch && (
          <Card withBorder p="md" bg="gray.1">
            <Text size="sm" weight={500} mb={8}>
              Batch Details:
            </Text>
            <Text size="sm">
              <strong>Name:</strong>{" "}
              {batch.name ||
                `${batch.programme} ${batch.displayBranch || batch.discipline}`}
            </Text>
            <Text size="sm">
              <strong>Discipline:</strong>{" "}
              {batch.displayBranch || batch.discipline}
            </Text>
            <Text size="sm">
              <strong>Year:</strong> {batch.year}
            </Text>
            <Text size="sm">
              <strong>Total Seats:</strong> {batch.totalSeats || 0}
            </Text>
            <Text size="sm">
              <strong>Filled Seats:</strong> {batch.filledSeats || 0}
            </Text>
          </Card>
        )}

        <Alert
          icon={<Warning size={16} />}
          title="Deletion Restrictions"
          color="orange"
        >
          <Text size="sm">
            • Cannot delete if this batch has enrolled students
            <br />• Cannot delete if ANY students exist in this discipline
            across ALL batches
            <br />• The entire discipline must be empty before deletion
          </Text>
        </Alert>

        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={onConfirm}
            leftSection={<Trash size={16} />}
          >
            Delete Batch
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

DeleteBatchModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  batch: PropTypes.instanceOf(Object),
  onConfirm: PropTypes.func.isRequired,
};

export default DeleteBatchModal;
