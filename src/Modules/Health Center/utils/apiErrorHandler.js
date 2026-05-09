/**
 * API Error Handler
 * Centralized error handling for all API calls
 */

import { notifications } from "@mantine/notifications";

/**
 * Parse error response and return standardized error object
 */
export const parseApiError = (error) => {
  const errorResponse = {
    code: "UNKNOWN_ERROR",
    message: "An unexpected error occurred",
    status: null,
    originalError: error,
  };

  if (error.response) {
    // Server responded with error status
    errorResponse.status = error.response.status;
    errorResponse.code = `HTTP_${error.response.status}`;

    // Try to extract message from response
    if (typeof error.response.data === "string") {
      errorResponse.message = error.response.data;
    } else if (error.response.data?.detail) {
      errorResponse.message = error.response.data.detail;
    } else if (error.response.data?.message) {
      errorResponse.message = error.response.data.message;
    } else {
      errorResponse.message = error.response.statusText || "Server error";
    }
  } else if (error.request) {
    // Request made but no response
    errorResponse.code = "NO_RESPONSE";
    errorResponse.message = "No response from server. Check your connection.";
  } else if (error.message) {
    // Error in request setup
    errorResponse.code = "REQUEST_ERROR";
    errorResponse.message = error.message;
  }

  return errorResponse;
};

/**
 * Show user-friendly error notification
 */
export const showErrorNotification = (error, title = "Error") => {
  const parsedError = parseApiError(error);

  notifications.show({
    title,
    message: parsedError.message,
    color: "red",
    autoClose: 5000,
    icon: null,
  });

  // Log for debugging
  if (process.env.NODE_ENV === "development") {
    console.error("API Error:", parsedError);
  }

  return parsedError;
};

/**
 * Show success notification
 */
export const showSuccessNotification = (message, title = "Success") => {
  notifications.show({
    title,
    message,
    color: "green",
    autoClose: 3000,
    icon: null,
  });
};

/**
 * Show info notification
 */
export const showInfoNotification = (message, title = "Info") => {
  notifications.show({
    title,
    message,
    color: "blue",
    autoClose: 3000,
    icon: null,
  });
};

/**
 * Show warning notification
 */
export const showWarningNotification = (message, title = "Warning") => {
  notifications.show({
    title,
    message,
    color: "yellow",
    autoClose: 3000,
    icon: null,
  });
};

/**
 * Wrap async function with error handling
 * Usage: const result = await handleApiCall(fetchDoctors());
 */
export const handleApiCall = async (
  promise,
  errorTitle = "Operation failed",
) => {
  try {
    const response = await promise;
    return { success: true, data: response.data, error: null };
  } catch (error) {
    const parsedError = showErrorNotification(error, errorTitle);
    return { success: false, data: null, error: parsedError };
  }
};
