/**
 * LoadingSpinner
 * Reusable loading indicator component
 * 
 * Supports multiple sizes and variants
 */

import React from "react";
import { Loader, Center, Box, Stack, Text } from "@mantine/core";

/**
 * Centered loading spinner
 * 
 * @param {Object} props
 * @param {string} props.size - Spinner size: xs, sm, md, lg, xl (default: md)
 * @param {string} props.variant - Spinner style: bars, dots, oval (default: dots)
 * @param {string} props.message - Optional loading message below spinner
 * @param {boolean} props.fullHeight - Make container full height (default: false)
 */
function LoadingSpinner({
  size = "md",
  variant = "dots",
  message = "",
  fullHeight = false,
}) {
  const containerHeight = fullHeight ? "100vh" : "auto";
  const containerMinHeight = fullHeight ? "200px" : "auto";

  return (
    <Center style={{ minHeight: containerMinHeight, height: containerHeight }}>
      <Stack align="center" spacing="md">
        <Loader size={size} variant={variant} />
        {message && (
          <Text size="sm" color="dimmed">
            {message}
          </Text>
        )}
      </Stack>
    </Center>
  );
}

/**
 * Inline loading spinner for integration into layouts
 * 
 * @param {Object} props
 * @param {string} props.size - Spinner size (default: sm)
 * @param {string} props.message - Optional message
 */
export function InlineLoadingSpinner({ size = "sm", message = "" }) {
  return (
    <Box style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <Loader size={size} />
      {message && <Text size="sm">{message}</Text>}
    </Box>
  );
}

/**
 * Loading overlay for covering content during async operations
 * 
 * @param {Object} props
 * @param {boolean} props.visible - Whether to show the overlay
 * @param {string} props.message - Message to display
 * @param {React.ReactNode} props.children - Content to overlay
 */
export function LoadingOverlay({ visible = false, message = "Loading...", children }) {
  return (
    <Box style={{ position: "relative" }}>
      {visible && (
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255, 255, 255, 0.7)",
            zIndex: 1000,
            borderRadius: "4px",
          }}
        >
          <Stack align="center" spacing="md">
            <Loader />
            {message && <Text size="sm">{message}</Text>}
          </Stack>
        </Box>
      )}
      {children}
    </Box>
  );
}

export default LoadingSpinner;
