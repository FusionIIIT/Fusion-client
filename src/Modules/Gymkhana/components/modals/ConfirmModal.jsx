import { Modal, Button, Group, Text } from "@mantine/core";
import PropTypes from "prop-types";

function ConfirmModal({
  opened,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmColor = "green",
  loading = false,
}) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} centered>
      <Text>{message}</Text>
      <Group position="apart" mt="md">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button color={confirmColor} onClick={onConfirm} loading={loading}>
          {confirmText}
        </Button>
      </Group>
    </Modal>
  );
}

ConfirmModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  confirmColor: PropTypes.string,
  loading: PropTypes.bool,
};

export default ConfirmModal;
