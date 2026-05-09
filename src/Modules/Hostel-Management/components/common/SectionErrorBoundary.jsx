import React from "react";
import PropTypes from "prop-types";
import { Alert, Button, Stack, Text } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";

class SectionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    // eslint-disable-next-line no-console
    console.error("Hostel section render error:", error);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Stack p="md">
          <Alert
            color="red"
            icon={<IconAlertCircle size={16} />}
            title="Section Error"
          >
            Unable to render this section. Please retry.
          </Alert>
          <Button variant="light" onClick={this.handleRetry}>
            Retry
          </Button>
          <Text size="sm" c="dimmed">
            If the problem continues, switch section and come back.
          </Text>
        </Stack>
      );
    }

    return this.props.children;
  }
}

SectionErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SectionErrorBoundary;
