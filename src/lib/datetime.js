function toDate(value) {
  if (!value) return null;
  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? null : value;

  const isoDay = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDay) {
    return new Date(
      Number(isoDay[1]),
      Number(isoDay[2]) - 1,
      Number(isoDay[3]),
    );
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatDate(value) {
  const date = toDate(value);
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatTime(value) {
  if (!value) return "";
  const [hours, minutes] = String(value).split(":");
  const hour = Number(hours);
  if (Number.isNaN(hour) || minutes === undefined) return "";
  return `${hour % 12 || 12}:${minutes} ${hour >= 12 ? "PM" : "AM"}`;
}

export function formatWhen(date, time) {
  const day = formatDate(date);
  if (!day) return "—";
  const clock = formatTime(time);
  return clock ? `${day}, ${clock}` : day;
}
