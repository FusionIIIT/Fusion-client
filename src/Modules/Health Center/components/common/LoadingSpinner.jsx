import React from "react";
import PropTypes from "prop-types";
import { Loader, Center, Stack, Text } from "@mantine/core";

/**
 * LoadingSpinner Component
 * Shows loading indicator with optional message
 */
function LoadingSpinner({
  message = "Loading...",
  size = "md",
  fullHeight = false,
}) {
  return (
    <Center h={fullHeight ? "100vh" : "auto"} py="xl">
      <Stack align="center" gap="md">
        <Loader size={size} />
        {message && <Text c="dimmed">{message}</Text>}
      </Stack>
    </Center>
  );
}

LoadingSpinner.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fullHeight: PropTypes.bool,
};

export default LoadingSpinner;
