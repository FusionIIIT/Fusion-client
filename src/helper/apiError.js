export function getApiErrorMessage(
  err,
  fallback = "Something went wrong. Please try again.",
) {
  if (!err) return fallback;

  if (err.request && !err.response) {
    return "Could not reach the server. Check your connection and try again.";
  }

  const data = err.response?.data;
  const status = err.response?.status;

  if (typeof data === "string") {
    const text = data.trim();
    if (text && !text.startsWith("<")) return text;
  }

  if (data && typeof data === "object") {
    const direct = data.message || data.error || data.detail;
    if (typeof direct === "string" && direct.trim()) return direct.trim();

    if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) {
      return String(data.non_field_errors[0]);
    }

    const fieldErrors = Object.entries(data)
      .filter(
        ([, value]) =>
          Array.isArray(value) && value.length && typeof value[0] === "string",
      )
      .map(([field, messages]) => `${field}: ${messages[0]}`);
    if (fieldErrors.length) return fieldErrors.join("; ");
  }

  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You do not have permission to do this.";
  if (status === 404) return "The requested record was not found.";
  if (status >= 500) {
    return "The server ran into a problem. Please try again shortly.";
  }

  if (!err.response && typeof err.message === "string" && err.message.trim()) {
    return err.message;
  }

  return fallback;
}

export default getApiErrorMessage;
