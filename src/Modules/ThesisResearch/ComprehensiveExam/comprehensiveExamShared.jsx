/**
 * Shared display maps for the PhD Comprehensive Examination UI.
 */

import PropTypes from "prop-types";

export const EXAM_STATUS_LABEL = {
  academic_office_pending: "Pending Academic Office Verification",
  academic_office_rejected: "Rejected by Academic Office",
  convener_pending: "Pending Convener Approval",
  convener_rejected: "Rejected by Convener",
  in_progress: "In Progress",
  passed: "Passed",
  failed_final: "Failed — Attempts Exhausted",
};

export const EXAM_STATUS_COLOR = {
  academic_office_pending: "yellow",
  academic_office_rejected: "red",
  convener_pending: "yellow",
  convener_rejected: "red",
  in_progress: "blue",
  passed: "green",
  failed_final: "red",
};

export const ATTEMPT_STATUS_LABEL = {
  subjects_floated: "Subjects Floated — Pending HOD Approval",
  hod_rejected: "Subjects Rejected by HOD",
  subjects_ready: "Subjects Approved — Awaiting Student Selection",
  subjects_opted: "Subjects Opted — Pending Supervisor Confirmation",
  confirmation_rejected: "Supervisor Sent Back for Re-selection",
  result_pending: "Confirmed — Awaiting Result",
  passed: "Passed",
  failed: "Failed",
};

export const ATTEMPT_STATUS_COLOR = {
  subjects_floated: "yellow",
  hod_rejected: "red",
  subjects_ready: "blue",
  subjects_opted: "yellow",
  confirmation_rejected: "red",
  result_pending: "blue",
  passed: "green",
  failed: "red",
};

export const ENTRY_QUALIFICATION_LABEL = {
  masters: "ME/M.Tech/M.Des/M.Phil (16 credits required)",
  bachelors: "B.Tech/B.E./M.Sc./MA (40 credits required)",
};

export const authHeaders = () => ({
  Authorization: `Token ${localStorage.getItem("authToken")}`,
});

export const currentAttempt = (exam) =>
  exam?.attempts?.find(
    (a) => a.attempt_number === exam.current_attempt_number,
  ) || null;

const COMMITTEE_MEMBER_SHAPE = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string,
  discipline: PropTypes.string,
});

const FLOATED_SUBJECT_SHAPE = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  subject_name: PropTypes.string,
  selected_by_student: PropTypes.bool,
});

const ATTEMPT_SHAPE = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  attempt_number: PropTypes.number,
  status: PropTypes.string,
  written_exam_date: PropTypes.string,
  oral_exam_date: PropTypes.string,
  hod_remarks: PropTypes.string,
  supervisor_confirmation_remarks: PropTypes.string,
  result: PropTypes.string,
  fundamentals_comment: PropTypes.string,
  problem_identification_comment: PropTypes.string,
  plan_of_work_comment: PropTypes.string,
  suggestions_comment: PropTypes.string,
  additional_literature_comment: PropTypes.string,
  milestone_plan_url: PropTypes.string,
  reported_at: PropTypes.string,
  subjects: PropTypes.arrayOf(FLOATED_SUBJECT_SHAPE),
});

// Shared PropTypes shape for the `exam` objects returned by
// comprehensive_exam_to_dict (backend), reused across the dashboard/modal
// components instead of redefining it in each one.
export const EXAM_SHAPE = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  student_name: PropTypes.string,
  student_roll: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  status: PropTypes.string,
  current_attempt_number: PropTypes.number,
  max_attempts: PropTypes.number,
  possible_thesis_title: PropTypes.string,
  entry_qualification: PropTypes.string,
  credits_completed: PropTypes.number,
  required_credits: PropTypes.number,
  current_cpi: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  academic_office_remarks: PropTypes.string,
  convener_remarks: PropTypes.string,
  supervisor: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
  }),
  co_supervisor: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
  }),
  committee: PropTypes.arrayOf(COMMITTEE_MEMBER_SHAPE),
  attempts: PropTypes.arrayOf(ATTEMPT_SHAPE),
});
