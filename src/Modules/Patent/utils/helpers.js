export const toDisplayDate = (value) => {
  if (!value) return "Not Provided";
  try {
    return new Date(value).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
};

export const toSafeArray = (value) => {
  if (Array.isArray(value)) return value;
  return [];
};
