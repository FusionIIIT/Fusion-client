export const MIN_ACADEMIC_YEAR = 2018;

export const academicYearLabel = (year) =>
  `${year}-${String(year + 1).slice(-2)}`;

// Descending "YYYY-YY" session options from endYear down to minYear.
export function buildSessionOptions(endYear, minYear = MIN_ACADEMIC_YEAR) {
  const options = [];
  for (let year = endYear; year >= minYear; year -= 1) {
    const label = academicYearLabel(year);
    options.push({ value: label, label });
  }
  return options;
}

// Same range as plain "YYYY-YY" strings, for screens that store just the string.
export function buildSessionLabels(endYear, minYear = MIN_ACADEMIC_YEAR) {
  return buildSessionOptions(endYear, minYear).map((option) => option.label);
}

// UG and PG batches start in August, so semester n of batch B runs in calendar
// year B + floor(n / 2): Odd semesters from August, Even ones from January.
export function allocationYear(batch, semester) {
  return Number(batch) + Math.floor(Number(semester) / 2);
}

// Which term a semester and the calendar year it runs in make, in words.
export function allocationTermLabel(semester, year) {
  const even = Number(semester) % 2 === 0;
  const session = academicYearLabel(even ? Number(year) - 1 : Number(year));
  return even
    ? `Even Semester of ${session} (January–May ${year})`
    : `Odd Semester of ${session} (from August ${year})`;
}

// Descending plain calendar-year options, for pickers that store just the year.
export function buildYearOptions(endYear, minYear = MIN_ACADEMIC_YEAR) {
  const options = [];
  for (let year = endYear; year >= minYear; year -= 1) {
    options.push({ value: String(year), label: String(year) });
  }
  return options;
}
