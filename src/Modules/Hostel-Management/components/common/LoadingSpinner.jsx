import React from "react";
import PropTypes from "prop-types";
import { Loader, Box, Text, Paper } from "@mantine/core";

export default function LoadingSpinner({
  message = "Loading...",
  fullscreen = false,
}) {
  if (fullscreen) {
    return (
      <Paper
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100vw",
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 1000,
          backgroundColor: "rgba(255, 255, 255, 0.7)",
        }}
      >
        <Box style={{ textAlign: "center" }}>
          <Loader size="lg" mb="md" />
          <Text>{message}</Text>
        </Box>
      </Paper>
    );
  }

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
      }}
    >
      <Loader size="md" mb="md" />
      <Text color="dimmed">{message}</Text>
    </Box>
  );
}

LoadingSpinner.propTypes = {
  message: PropTypes.string,
  fullscreen: PropTypes.bool,
};
