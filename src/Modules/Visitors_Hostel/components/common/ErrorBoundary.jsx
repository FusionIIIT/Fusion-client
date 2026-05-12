/**
 * React Error Boundary for Visitor Hostel Module
 * Catches JavaScript errors anywhere in the child component tree
 */

import React from 'react';
import { Alert, Button, Container, Stack, Text, Title } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { ErrorHandlers } from '../../utils/errorHandler';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error with our centralized error handler
    ErrorHandlers.criticalError(error, `React Component: ${errorInfo.componentStack}`);
    
    this.setState({
      error,
      errorInfo
    });

    // Log additional details for debugging
    console.group('🚨 React Error Boundary Triggered');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.groupEnd();
  }

  handleReload = () => {
    window.location.reload();
  };

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      return (
        <Container size="sm" py="xl">
          <Stack spacing="lg" align="center">
            <IconAlertTriangle size={64} color="red" />
            
            <Title order={2} align="center" color="dimmed">
              Something went wrong
            </Title>
            
            <Alert 
              icon={<IconAlertTriangle size="1rem" />} 
              title="Application Error" 
              color="red"
              style={{ width: '100%' }}
            >
              <Text size="sm" mb="md">
                We're sorry, but something unexpected happened. Our team has been 
                automatically notified about this issue.
              </Text>
              
              {isDevelopment && this.state.error && (
                <Text size="xs" color="dimmed" style={{ fontFamily: 'monospace' }}>
                  Error: {this.state.error.toString()}
                </Text>
              )}
              
              <Stack spacing="sm" mt="md">
                <Button 
                  leftIcon={<IconRefresh size="1rem" />}
                  onClick={this.handleRetry}
                  variant="outline"
                  color="red"
                >
                  Try Again
                </Button>
                
                <Button 
                  onClick={this.handleReload}
                  color="red"
                >
                  Reload Page
                </Button>
              </Stack>
            </Alert>
            
            {isDevelopment && this.state.errorInfo && (
              <Alert 
                title="Debug Information (Development Only)" 
                color="gray"
                style={{ width: '100%' }}
              >
                <Text size="xs" style={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                  {this.state.errorInfo.componentStack}
                </Text>
              </Alert>
            )}
            
            <Text size="sm" color="dimmed" align="center">
              If this problem persists, please contact the system administrator.
            </Text>
          </Stack>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;