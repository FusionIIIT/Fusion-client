/** Shared semester dropdown options used by Grade Sheet, Transcript, and Announce Result forms.
 *  Generated (rather than hand-listed) so the range comfortably covers PhD students, whose
 *  registered semesters can run well past a 4-year UG/2-year PG horizon. */
export const MAX_SEMESTER = 20;

export function buildSemesterOptions(maxSemester = MAX_SEMESTER) {
  const options = [];
  for (let no = 1; no <= maxSemester; no += 1) {
    const type = no % 2 === 0 ? "Even Semester" : "Odd Semester";
    options.push({
      value: JSON.stringify({ no, type }),
      label: `Semester ${no}`,
    });
    if (no % 2 === 0) {
      options.push({
        value: JSON.stringify({ no, type: "Summer Semester" }),
        label: `Summer ${no / 2}`,
      });
    }
  }
  return options;
}

export function buildSemesterNumberOptions(
  semesterType,
  maxSemester = MAX_SEMESTER,
) {
  if (!semesterType) return [];
  if (semesterType === "Odd Semester") {
    const options = [];
    for (let no = 1; no <= maxSemester; no += 2) {
      options.push({ value: String(no), label: `Semester ${no}` });
    }
    return options;
  }
  if (semesterType === "Even Semester") {
    const options = [];
    for (let no = 2; no <= maxSemester; no += 2) {
      options.push({ value: String(no), label: `Semester ${no}` });
    }
    return options;
  }
  const options = [];
  let summerNo = 1;
  for (let no = 2; no <= maxSemester; no += 2) {
    options.push({ value: String(no), label: `Summer ${summerNo}` });
    summerNo += 1;
  }
  return options;
}

export const SEMESTER_OPTIONS = buildSemesterOptions();
