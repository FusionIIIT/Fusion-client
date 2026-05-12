/**
 * Centralized Error Handling for Visitor Hostel Module
 * Provides user-friendly error messages and proper error logging
 */

import React, { createElement } from 'react';
import { notifications } from '@mantine/notifications';
import { IconX, IconExclamationMark, IconAlertTriangle } from '@tabler/icons-react';

/**
 * Error severity levels
 */
export const ERROR_SEVERITY = {
  INFO: 'info',
  WARNING: 'warning', 
  ERROR: 'error',
  CRITICAL: 'critical'
};

/**
 * User-friendly error message mappings
 */
const ERROR_MESSAGES = {
  // Network errors
  'Network Error': 'Unable to connect to the server. Please check your internet connection.',
  'timeout': 'Request timed out. Please try again.',
  'ECONNREFUSED': 'Server is currently unavailable. Please try again later.',

  // Authentication errors  
  '401': 'Your session has expired. Please log in again.',
  'Unauthorized': 'You do not have permission to perform this action.',
  
  // Validation errors
  '400': 'Please check your input and try again.',
  'ValidationError': 'Please fill in all required fields correctly.',
  
  // Server errors
  '500': 'A server error occurred. Our team has been notified.',
  '502': 'Service temporarily unavailable. Please try again in a moment.',
  '503': 'System maintenance in progress. Please try again later.',

  // Visitor Hostel specific errors
  'BR-VH-014 Violation': 'This bill cannot be modified as the guest has already checked out.',
  'room.*not.*available': 'Selected rooms are no longer available. Please choose different rooms.',
  'booking.*confirmed': 'This booking has already been confirmed and cannot be modified.',
  'insufficient.*permissions': 'You do not have permission to perform this action.',
  
  // Default fallback
  default: 'An unexpected error occurred. Please try again or contact support if the issue persists.'
};

/**
 * Get user-friendly error message
 */
function getUserFriendlyMessage(error) {
  const errorText = error?.message || error?.detail || error?.error || String(error);
  
  // Check for specific error patterns
  for (const [pattern, message] of Object.entries(ERROR_MESSAGES)) {
    if (pattern === 'default') continue;
    
    if (errorText.includes(pattern) || new RegExp(pattern, 'i').test(errorText)) {
      return message;
    }
  }
  
  return ERROR_MESSAGES.default;
}

/**
 * Get appropriate icon for error severity
 */
function getErrorIcon(severity) {
  switch (severity) {
    case ERROR_SEVERITY.WARNING:
      return createElement(IconExclamationMark, { size: '1.1rem' });
    case ERROR_SEVERITY.ERROR:
      return createElement(IconX, { size: '1.1rem' });
    case ERROR_SEVERITY.CRITICAL:
      return createElement(IconAlertTriangle, { size: '1.1rem' });
    default:
      return createElement(IconX, { size: '1.1rem' });
  }
}

/**
 * Enhanced error handler with user-friendly notifications
 */
export function handleError(error, options = {}) {
  const {
    severity = ERROR_SEVERITY.ERROR,
    title = 'Error',
    showNotification = true,
    logToConsole = true,
    context = 'Unknown',
    userId = null
  } = options;

  // Extract error details
  const errorDetails = {
    message: error?.message || error?.detail || error?.error || String(error),
    status: error?.response?.status || error?.status,
    statusText: error?.response?.statusText,
    url: error?.config?.url,
    method: error?.config?.method,
    data: error?.response?.data,
    timestamp: new Date().toISOString(),
    context,
    userId,
    userAgent: navigator.userAgent,
    url_current: window.location.href
  };

  // Get user-friendly message
  const userMessage = getUserFriendlyMessage(error);

  // Log detailed error (for developers)
  if (logToConsole) {
    console.group(`🚨 Visitor Hostel Error - ${context}`);
    console.error('User Message:', userMessage);
    console.error('Error Details:', errorDetails);
    console.error('Original Error:', error);
    console.groupEnd();
  }

  // Send error to logging service (if available)
  try {
    // This would integrate with your logging service
    logErrorToService(errorDetails);
  } catch (logError) {
    console.warn('Failed to log error to service:', logError);
  }

  // Show user-friendly notification
  if (showNotification) {
    const notificationColor = {
      [ERROR_SEVERITY.INFO]: 'blue',
      [ERROR_SEVERITY.WARNING]: 'yellow', 
      [ERROR_SEVERITY.ERROR]: 'red',
      [ERROR_SEVERITY.CRITICAL]: 'red'
    }[severity] || 'red';

    notifications.show({
      title,
      message: userMessage,
      color: notificationColor,
      icon: getErrorIcon(severity),
      autoClose: severity === ERROR_SEVERITY.CRITICAL ? false : 5000,
      withBorder: true
    });
  }

  return {
    userMessage,
    errorDetails,
    severity
  };
}

/**
 * Specific error handlers for common scenarios
 */
export const ErrorHandlers = {
  // Network/API errors
  networkError: (error, context = 'API Request') => 
    handleError(error, { 
      severity: ERROR_SEVERITY.ERROR,
      title: 'Connection Error',
      context 
    }),

  // Validation errors
  validationError: (error, context = 'Form Validation') =>
    handleError(error, {
      severity: ERROR_SEVERITY.WARNING,
      title: 'Validation Error', 
      context
    }),

  // Permission errors
  permissionError: (error, context = 'Authorization') =>
    handleError(error, {
      severity: ERROR_SEVERITY.WARNING,
      title: 'Permission Denied',
      context
    }),

  // Critical system errors
  criticalError: (error, context = 'System Error') =>
    handleError(error, {
      severity: ERROR_SEVERITY.CRITICAL,
      title: 'Critical Error',
      context
    }),

  // Booking-specific errors
  bookingError: (error, context = 'Booking Operation') =>
    handleError(error, {
      severity: ERROR_SEVERITY.ERROR,
      title: 'Booking Error',
      context
    }),

  // Payment/billing errors
  billingError: (error, context = 'Billing Operation') =>
    handleError(error, {
      severity: ERROR_SEVERITY.ERROR,
      title: 'Billing Error',
      context
    })
};

/**
 * Log error to external service (implement based on your logging service)
 */
function logErrorToService(errorDetails) {
  // Example implementation - replace with your actual logging service
  if (process.env.NODE_ENV === 'production') {
    // Send to logging service like Sentry, LogRocket, etc.
    try {
      fetch('/api/logs/client-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          module: 'visitor_hostel',
          ...errorDetails
        })
      }).catch(() => {
        // Silent failure - don't interrupt user experience
      });
    } catch (e) {
      // Silent failure
    }
  }
}

/**
 * Higher-order component for error boundaries
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    handleError(error, {
      severity: ERROR_SEVERITY.CRITICAL,
      title: 'Application Crash',
      context: `React Component: ${errorInfo.componentStack}`,
      showNotification: false // Don't show notification for crashes
    });
  }

  render() {
    if (this.state.hasError) {
      return React.createElement(
        'div',
        { className: 'error-boundary-fallback' },
        React.createElement('h2', null, 'Something went wrong'),
        React.createElement('p', null, "We're sorry, but something unexpected happened."),
        React.createElement(
          'button',
          { onClick: () => window.location.reload() },
          'Reload Page'
        )
      );
    }

    return this.props.children;
  }
}