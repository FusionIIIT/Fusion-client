// A summer term is numbered from the even semester right before it -- semester
// 2 is Summer 1, semester 4 is Summer 2 -- for any semester, not just the first few.
export const summerNumber = (semesterNo) => Math.floor(semesterNo / 2);

// How far the admin semester/course dropdowns run. Raised from 12 (6 summer
// terms) to cover students who take longer than that.
export const MAX_ADMIN_SEMESTER = 16;

// { no, type } options for the manual-allotment screens: one row per semester,
// odd and even, with a summer row folded in right after each even semester.
export function buildAdminSemesterOptions(maxSemester = MAX_ADMIN_SEMESTER) {
  const options = [];
  for (let no = 1; no <= maxSemester; no += 1) {
    const isEven = no % 2 === 0;
    options.push({
      value: JSON.stringify({
        no,
        type: isEven ? "Even Semester" : "Odd Semester",
      }),
      label: `Semester ${no} (${isEven ? "Even" : "Odd"})`,
    });
    if (isEven) {
      options.push({
        value: JSON.stringify({ no, type: "Summer Semester" }),
        label: `Summer Term ${summerNumber(no)}`,
      });
    }
  }
  return options;
}
