import { Select } from "@mantine/core";
import PropTypes from "prop-types";

export default function SlotSelect({
  label,
  value,
  onChange,
  placeholder,
  options,
}) {
  return (
    <Select
      aria-label={label}
      placeholder={placeholder}
      data={options.map((option) => ({
        value: String(option.value),
        label: String(option.label),
        disabled: option.disabled,
      }))}
      value={value ? String(value) : null}
      onChange={(next) => onChange(next ?? "")}
      w="100%"
      miw={150}
      clearable
      maxDropdownHeight={320}
      comboboxProps={{ withinPortal: true }}
    />
  );
}

SlotSelect.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      label: PropTypes.node.isRequired,
      disabled: PropTypes.bool,
    }),
  ).isRequired,
};
