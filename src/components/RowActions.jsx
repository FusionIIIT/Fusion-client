import { ActionIcon, Group } from "@mantine/core";
import { PencilSimple, Trash } from "@phosphor-icons/react";
import PropTypes from "prop-types";

export default function RowActions({
  label,
  onEdit,
  onDelete,
  disabled = false,
}) {
  return (
    <Group gap="xs" wrap="nowrap">
      <ActionIcon
        variant="light"
        color="blue"
        onClick={onEdit}
        disabled={disabled}
        aria-label={`Edit ${label}`}
      >
        <PencilSimple size={16} />
      </ActionIcon>
      <ActionIcon
        variant="light"
        color="red"
        onClick={onDelete}
        disabled={disabled}
        aria-label={`Delete ${label}`}
      >
        <Trash size={16} />
      </ActionIcon>
    </Group>
  );
}

RowActions.propTypes = {
  label: PropTypes.string.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};
