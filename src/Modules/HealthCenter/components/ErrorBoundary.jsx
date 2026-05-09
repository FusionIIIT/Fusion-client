import React, { Component } from 'react';
import { Title, Text, Button, Container, Group } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // We could log this to a structured error service in production
    console.warn('React Error Boundary Caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container size="md" py="xl" style={{ textAlign: 'center', marginTop: '10vh' }}>
          <IconAlertTriangle size={64} color="red" style={{ marginBottom: '1rem' }} />
          <Title order={2} mb="md">Something went wrong in the Interface</Title>
          <Text color="dimmed" mb="xl">
            An unexpected error occurred while rendering the dashboard. Our technical team has been notified.
            You can try reloading the page to resolve this issue.
          </Text>
          <Group position="center">
            <Button
              variant="default"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              Reload Page
            </Button>
          </Group>
        </Container>
      );
    }

    return this.props.children;
  }
}
