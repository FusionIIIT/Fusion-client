import { CloseButton, TextInput } from "@mantine/core";
import { MagnifyingGlass } from "@phosphor-icons/react";
import PropTypes from "prop-types";

export default function SearchInput({
  value,
  onChange,
  placeholder = "Search",
  label,
  width = { base: "100%", sm: 320 },
}) {
  return (
    <TextInput
      placeholder={placeholder}
      aria-label={label ?? placeholder}
      leftSection={<MagnifyingGlass size={15} />}
      rightSection={
        value ? (
          <CloseButton
            size="sm"
            aria-label="Clear search"
            onClick={() => onChange("")}
          />
        ) : null
      }
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      w={width}
    />
  );
}

SearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  width: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.object,
  ]),
};
