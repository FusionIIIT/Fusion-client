export function errorMessage(e) {
  if (typeof e === "string" && e.trim()) return e;

  const data = e?.response?.data;
  if (typeof data === "string" && data.trim()) return data;

  if (data && typeof data === "object") {
    const direct = data.detail ?? data.message ?? data.error;
    if (typeof direct === "string" && direct.trim()) return direct;
    if (direct && typeof direct === "object") {
      const nested = direct.message ?? direct.detail;
      if (typeof nested === "string" && nested.trim()) return nested;
    }

    const fieldErrors = Object.entries(data)
      .filter(([, v]) => Array.isArray(v) && v.length)
      .map(([field, msgs]) => `${field}: ${msgs.join(" ")}`);
    if (fieldErrors.length) return fieldErrors.join(" · ");
  }

  if (e?.message) return e.message;
  return "Something went wrong. Please try again.";
}

export function errorStatus(e) {
  return e?.response?.status;
}
