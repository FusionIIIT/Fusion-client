export const matchesQuery = (query, values) => {
  const tokens = String(query ?? "")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  if (tokens.length === 0) return true;

  const haystack = values
    .filter((value) => value !== null && value !== undefined)
    .map((value) => String(value).toLowerCase())
    .join(" ");

  return tokens.every((token) => haystack.includes(token));
};

export default matchesQuery;
