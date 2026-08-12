import PropTypes from "prop-types";
import { Modal, Stack, Text, Group, Button } from "@mantine/core";

// Confirm deletion of a single student.
function DeleteStudentModal({ opened, onClose, student, deleting, onConfirm }) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Confirm Delete Student"
      size="lg"
      centered
    >
      <Stack spacing="md">
        <Text>
          Are you sure you want to delete student{" "}
          <strong>&quot;{student?.name}&quot;</strong>?
        </Text>
        <Text size="sm" color="dimmed">
          This action cannot be undone.
        </Text>
        <Text size="sm" color="orange">
          Note: If this student has associated records in other modules, deletion
          may not be possible due to database constraints.
        </Text>

        <Group justify="flex-end" mt="md">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button color="red" loading={deleting} onClick={onConfirm}>
            Delete Student
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

DeleteStudentModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  student: PropTypes.object,
  deleting: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
};

export default DeleteStudentModal;
