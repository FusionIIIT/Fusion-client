import { useState } from "react";
import { Alert, Anchor, Stack, Text } from "@mantine/core";
import PropTypes from "prop-types";
import { useMediaQuery } from "@mantine/hooks";

export const DESKTOP_MIN_WIDTH = 992;

export function DesktopOnly({ title, children }) {
  const [override, setOverride] = useState(false);
  const narrow = useMediaQuery(`(max-width: ${DESKTOP_MIN_WIDTH - 1}px)`);

  if (!narrow || override) return children;

  return (
    <Alert color="blue" variant="light" title="Open this on a larger screen">
      <Stack gap="xs" align="flex-start">
        <Text size="sm">
          {title} works with wide tables and bulk actions, so it needs at least{" "}
          {DESKTOP_MIN_WIDTH}px of width. Open it on a laptop or desktop, or
          switch your browser to desktop mode.
        </Text>
        <Anchor
          component="button"
          type="button"
          size="sm"
          onClick={() => setOverride(true)}
        >
          Show it anyway
        </Anchor>
      </Stack>
    </Alert>
  );
}

DesktopOnly.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default DesktopOnly;
