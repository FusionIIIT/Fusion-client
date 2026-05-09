import PropTypes from "prop-types";
import { Text } from "@mantine/core";

export default function EmptyState({ message }) {
  return (
    <Text mt="lg" ta="center" c="dimmed">
      {message}
    </Text>
  );
}

EmptyState.propTypes = {
  message: PropTypes.string,
};

EmptyState.defaultProps = {
  message: "No data found!",
};
