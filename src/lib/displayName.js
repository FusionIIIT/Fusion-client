export const displayName = (value, fallback = "") =>
  String(value ?? "")
    .replace(/_+/g, " ")
    .replace(/\s+/g, " ")
    .trim() || fallback;

export default displayName;
