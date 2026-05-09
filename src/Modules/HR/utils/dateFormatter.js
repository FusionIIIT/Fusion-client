export const formatDateTime = (value) => {
  if (!value) return "-";
  const [datePart, timePart] = value.split("T");
  if (!timePart) return datePart;
  const prettyTime = timePart.split(".")[0];
  return `${datePart} ${prettyTime}`;
};
