// What to tell the office after Add course: the server says when it recorded
// the course as Backlog (a course of a semester the student dropped).
export function addCourseMessage(data) {
  return data?.message || "Course has been added successfully";
}
