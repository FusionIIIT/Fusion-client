/**
 * Shared display maps for the PhD Teaching Credit UI.
 */

import PropTypes from "prop-types";

export const STATUS_LABEL = {
  pending: "Pending HOD Decision",
  sent_back: "Sent Back by HOD",
  allocated: "Course Allocated",
  completed: "Completed",
};

export const STATUS_COLOR = {
  pending: "yellow",
  sent_back: "red",
  allocated: "blue",
  completed: "green",
};

export const RESULT_LABEL = {
  satisfactory: "Satisfactory",
  not_satisfactory: "Not Satisfactory",
};

export const BAND_OPTIONS = [
  { value: "<80", label: "<80%" },
  { value: "80-90", label: "80%-90%" },
  { value: "90-95", label: "90%-95%" },
  { value: "95-100", label: "95%-100%" },
];

export const QUALITY_OPTIONS = [
  { value: "Poor", label: "Poor" },
  { value: "Average", label: "Average" },
  { value: "Good", label: "Good" },
  { value: "Excellent", label: "Excellent" },
];

export const authHeaders = () => ({
  Authorization: `Token ${localStorage.getItem("authToken")}`,
});

const COURSE_SHAPE = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  code: PropTypes.string,
  name: PropTypes.string,
});

const EVALUATION_SHAPE = PropTypes.shape({
  punctuality_band: PropTypes.string,
  schedule_adherence_band: PropTypes.string,
  topics_sequence: PropTypes.string,
  teaching_aids: PropTypes.string,
  questions_answered: PropTypes.string,
  overall_effectiveness: PropTypes.string,
  strengths_weaknesses: PropTypes.string,
});

// Shared PropTypes shape for the registration objects returned by
// teaching_credit_to_dict (backend).
export const REGISTRATION_SHAPE = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  student_name: PropTypes.string,
  student_roll: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  student_discipline: PropTypes.string,
  semester_no: PropTypes.number,
  choices: PropTypes.arrayOf(COURSE_SHAPE),
  status: PropTypes.string,
  allocated_course: COURSE_SHAPE,
  hod_remarks: PropTypes.string,
  result: PropTypes.string,
  evaluation_count: PropTypes.number,
  evaluations: PropTypes.arrayOf(EVALUATION_SHAPE),
});
