import PropTypes from "prop-types";
import { Stack, Text } from "@mantine/core";
import ConfirmDialog from "../../../../components/ConfirmDialog";

function DeleteStudentModal({ opened, onClose, student, deleting, onConfirm }) {
  return (
    <ConfirmDialog
      opened={opened}
      onCancel={onClose}
      onConfirm={onConfirm}
      loading={deleting}
      title="Confirm Delete Student"
      confirmLabel="Delete Student"
      size="lg"
      message={
        <Stack gap="md">
          <Text>
            Are you sure you want to delete student{" "}
            <strong>&quot;{student?.name}&quot;</strong>?
          </Text>
          <Text size="sm" c="dimmed">
            This action cannot be undone.
          </Text>
          <Text size="sm" c="orange">
            Note: If this student has associated records in other modules,
            deletion may not be possible due to database constraints.
          </Text>
        </Stack>
      }
    />
  );
}

DeleteStudentModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  student: PropTypes.instanceOf(Object),
  deleting: PropTypes.bool,
  onConfirm: PropTypes.func.isRequired,
};

export default DeleteStudentModal;
