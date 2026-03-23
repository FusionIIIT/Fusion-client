import React from "react";
import PropTypes from "prop-types";
import { Container, Stack, Title, Text, Button } from "@mantine/core";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
    });

    // Log error for debugging
    console.error("Error Boundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container size="md" py="xl">
          <Stack align="center" gap="md">
            <Title order={2} c="red">
              Something went wrong
            </Title>
            <Text c="dimmed">
              An unexpected error occurred in the Health Center module.
              {process.env.NODE_ENV === "development" && (
                <>
                  <br />
                  <Text size="sm" mt="md" c="gray">
                    Error: {this.state.error?.toString()}
                  </Text>
                </>
              )}
            </Text>
            <Button onClick={this.handleReset} color="blue">
              Try Again
            </Button>
            <Button
              onClick={() => {
                window.location.href = "/";
              }}
              color="gray"
              variant="default"
            >
              Go to Home
            </Button>
          </Stack>
        </Container>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
