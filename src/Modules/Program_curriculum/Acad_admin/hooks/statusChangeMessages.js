// What to tell the office when an admission status change is refused: the
// server's own message (for example that the student has records and must be
// withdrawn on the Student Status page), not a generic "try again".

export function failureMessage(result, fallback) {
  const { error } = result ?? {};
  if (typeof error === "string" && error) return error;
  return error?.message || error?.error || fallback;
}

export function bulkFailureNote(messages) {
  const reasons = [...new Set(messages.filter(Boolean))];
  return reasons.length ? ` Reasons: ${reasons.join(" ")}` : "";
}
