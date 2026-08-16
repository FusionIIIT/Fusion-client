import { Button, Group, Modal, Text } from "@mantine/core";
import PropTypes from "prop-types";

export default function ConfirmDialog({
  opened,
  onCancel,
  onConfirm,
  message,
  title = "Warning",
  confirmLabel = "Remove",
  cancelLabel = "Cancel",
  confirmColor = "red",
  loading = false,
  size = "sm",
}) {
  return (
    <Modal
      opened={opened}
      onClose={onCancel}
      title={title}
      centered
      size={size}
      radius="md"
      closeButtonProps={{ "aria-label": "Close" }}
    >
      <Text size="sm">{message}</Text>
      <Group justify="flex-end" gap="sm" mt="lg">
        <Button variant="default" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button color={confirmColor} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </Group>
    </Modal>
  );
}

ConfirmDialog.propTypes = {
  opened: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  message: PropTypes.node.isRequired,
  title: PropTypes.string,
  confirmLabel: PropTypes.string,
  cancelLabel: PropTypes.string,
  confirmColor: PropTypes.string,
  loading: PropTypes.bool,
  size: PropTypes.string,
};
