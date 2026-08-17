import { Text } from "@mantine/core";
import PropTypes from "prop-types";

import { formatStamp } from "../lib/datetime";

export default function Stamp({ value }) {
  const { day, clock } = formatStamp(value);
  return (
    <>
      <Text size="sm">{day}</Text>
      {clock && (
        <Text size="xs" c="dimmed">
          {clock}
        </Text>
      )}
    </>
  );
}

Stamp.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
};
