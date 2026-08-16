import { Alert, Text } from "@mantine/core";
import PropTypes from "prop-types";
import { Warning } from "@phosphor-icons/react";

import { errorMessage, errorStatus } from "../../lib/errors";

export function ErrorState({ error = null, title = "Could not load this" }) {
  const status = errorStatus(error);
  return (
    <Alert
      color="red"
      variant="light"
      icon={<Warning size={18} />}
      title={title}
    >
      <Text size="sm">{errorMessage(error)}</Text>
      {status && (
        <Text size="xs" c="dimmed" mt={6} ff="monospace">
          HTTP {status}
        </Text>
      )}
    </Alert>
  );
}

ErrorState.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  error: PropTypes.any,
  title: PropTypes.string,
};

export default ErrorState;
