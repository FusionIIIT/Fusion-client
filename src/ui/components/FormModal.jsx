import { Box, Button, Group, Modal, ScrollArea, Text } from "@mantine/core";
import PropTypes from "prop-types";

import { ErrorState } from "./ErrorState";

export function FormModal({
  opened,
  onClose,
  title,
  subtitle = undefined,
  children,
  onSubmit,
  submitLabel = "Save",
  submitting = false,
  error = null,
  danger = false,
  disabled = false,
  disabledReason = undefined,
  size = "lg",
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      padding={0}
      radius="md"
      size={size}
      withCloseButton={false}
      centered
    >
      <Box
        px="lg"
        py="md"
        style={{
          background: "linear-gradient(135deg, #0c1526 0%, #15304f 100%)",
          color: "#fff",
        }}
      >
        <Text fw={700} size="lg">
          {title}
        </Text>
        {subtitle && (
          <Text size="sm" c="rgba(255,255,255,.62)" mt={2}>
            {subtitle}
          </Text>
        )}
      </Box>

      <ScrollArea.Autosize mah="min(60vh, 34rem)" type="auto">
        <Box px="lg" py="lg">
          {error != null && (
            <Box mb="md">
              <ErrorState error={error} title="Could not save this" />
            </Box>
          )}
          {children}
        </Box>
      </ScrollArea.Autosize>

      <Group
        justify="space-between"
        wrap="nowrap"
        px="lg"
        py="md"
        style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}
      >
        <Text size="xs" c="dimmed" lineClamp={2}>
          {disabled && disabledReason ? disabledReason : ""}
        </Text>
        <Group gap="sm" wrap="nowrap">
          <Button variant="default" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
            loading={submitting}
            disabled={disabled}
            color={danger ? "red" : undefined}
          >
            {submitLabel}
          </Button>
        </Group>
      </Group>
    </Modal>
  );
}

FormModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  children: PropTypes.node.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitLabel: PropTypes.string,
  submitting: PropTypes.bool,
  // eslint-disable-next-line react/forbid-prop-types
  error: PropTypes.any,
  danger: PropTypes.bool,
  disabled: PropTypes.bool,
  disabledReason: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default FormModal;
