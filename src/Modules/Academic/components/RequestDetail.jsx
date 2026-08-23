import PropTypes from "prop-types";
import { Text } from "@mantine/core";

export default function RequestDetail({ detail, note = "" }) {
  return (
    <>
      <Text size="sm">{detail}</Text>
      {note ? (
        <Text size="xs" c="dimmed">
          {note}
        </Text>
      ) : null}
    </>
  );
}

RequestDetail.propTypes = {
  detail: PropTypes.node.isRequired,
  note: PropTypes.string,
};
