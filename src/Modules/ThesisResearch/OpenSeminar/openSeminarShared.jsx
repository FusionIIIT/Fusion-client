/**
 * Shared display maps for the PhD Open Seminar UI.
 */

import PropTypes from "prop-types";

export const SEMINAR_STATUS_LABEL = {
  hod_pending: "Pending Convener (DPGC) Review",
  hod_rejected: "Rejected by Convener (DPGC)",
  dean_pending: "Pending Dean Academic Approval",
  dean_rejected: "Rejected by Dean Academic",
  in_progress: "In Progress",
  satisfactory: "Satisfactory",
};

export const SEMINAR_STATUS_COLOR = {
  hod_pending: "yellow",
  hod_rejected: "red",
  dean_pending: "yellow",
  dean_rejected: "red",
  in_progress: "blue",
  satisfactory: "green",
};

export const ATTEMPT_STATUS_LABEL = {
  rpc_pending: "Pending RPC Consensus",
  hod_review_pending: "RPC Finalized — Pending Convener (DPGC) Review",
  dean_pending: "Approved by Convener — Pending Dean Academic",
  satisfactory: "Satisfactory",
  not_satisfactory: "Not Satisfactory",
};

export const ATTEMPT_STATUS_COLOR = {
  rpc_pending: "yellow",
  hod_review_pending: "blue",
  dean_pending: "blue",
  satisfactory: "green",
  not_satisfactory: "red",
};

export const RATING_3WAY_OPTIONS = [
  { value: "Enough", label: "Enough" },
  { value: "Just", label: "Just Sufficient" },
  { value: "Insuff", label: "Insufficient" },
];

export const QUALITY_OPTIONS = [
  { value: "Excellent", label: "Excellent" },
  { value: "Good", label: "Good" },
  { value: "Sat", label: "Satisfactory" },
  { value: "Unsat", label: "Unsatisfactory" },
];

export const authHeaders = () => ({
  Authorization: `Token ${localStorage.getItem("authToken")}`,
});

export const currentAttempt = (seminar) =>
  seminar?.attempts?.find(
    (a) => a.attempt_number === seminar.current_attempt_number,
  ) || null;

// True once every RPC member has consented but nobody has finalized yet.
export const isAttemptReadyToForward = (attempt) =>
  attempt?.status === "rpc_pending" &&
  attempt.committee_size > 0 &&
  attempt.consented_count >= attempt.committee_size;

const COMMITTEE_MEMBER_SHAPE = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string,
  discipline: PropTypes.string,
});

const ATTEMPT_SHAPE = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  attempt_number: PropTypes.number,
  status: PropTypes.string,
  seminar_date: PropTypes.string,
  result: PropTypes.string,
  committee_comments: PropTypes.string,
  reported_at: PropTypes.string,
  hod_review_remarks: PropTypes.string,
  hod_reviewed_at: PropTypes.string,
  dean_approved_at: PropTypes.string,
  dean_nominee: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
  }),
  dn_submitted_at: PropTypes.string,
  dn_quality: PropTypes.string,
  dn_quantity: PropTypes.string,
  dn_publications: PropTypes.string,
  dn_overall: PropTypes.string,
  dn_comments: PropTypes.string,
  consented_count: PropTypes.number,
  committee_size: PropTypes.number,
});

// Shared PropTypes shape for the `seminar` objects returned by
// open_seminar_to_dict (backend), reused across dashboard/modal components.
export const OPEN_SEMINAR_SHAPE = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  student_name: PropTypes.string,
  student_roll: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  student_discipline: PropTypes.string,
  semester_no: PropTypes.number,
  status: PropTypes.string,
  current_attempt_number: PropTypes.number,
  possible_thesis_title: PropTypes.string,
  proposed_date: PropTypes.string,
  course_work_credits: PropTypes.number,
  progress_seminar_credits: PropTypes.number,
  thesis_research_credits: PropTypes.number,
  teaching_credits: PropTypes.number,
  total_credits: PropTypes.number,
  semesters_completed: PropTypes.number,
  rpc_recommended_open_seminar: PropTypes.bool,
  first_draft_sent_to_dean: PropTypes.bool,
  hod_remarks: PropTypes.string,
  dean_remarks: PropTypes.string,
  nominee_attempt_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
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
