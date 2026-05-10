import React from "react";
import PropTypes from "prop-types";
import { Box, Loader, Text } from "@mantine/core";

function LoadingSpinner({ message = "Loading..." }) {
  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 0",
      }}
    >
      <Loader size="lg" color="blue" />
      <Text mt="sm">{message}</Text>
    </Box>
  );
}

LoadingSpinner.propTypes = {
  message: PropTypes.string,
};

export default LoadingSpinner;
