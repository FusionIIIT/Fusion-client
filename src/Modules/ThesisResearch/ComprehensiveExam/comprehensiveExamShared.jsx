/**
 * Shared display maps for the PhD Comprehensive Examination UI.
 */

import PropTypes from "prop-types";

export const EXAM_STATUS_LABEL = {
  academic_office_pending: "Pending Academic Office Verification",
  academic_office_rejected: "Rejected by Academic Office",
  dpgc_pending: "Pending Convener (DPGC) Approval",
  dpgc_rejected: "Rejected by Convener (DPGC)",
  in_progress: "In Progress",
  passed: "Passed",
  failed_final: "Failed — Attempts Exhausted",
};

export const EXAM_STATUS_COLOR = {
  academic_office_pending: "yellow",
  academic_office_rejected: "red",
  dpgc_pending: "yellow",
  dpgc_rejected: "red",
  in_progress: "blue",
  passed: "green",
  failed_final: "red",
};

export const ATTEMPT_STATUS_LABEL = {
  rpc_pending: "Pending RPC Consensus",
  pgcs_pending: "RPC Finalized — Pending Convener (PGCS) Review",
  dean_pending: "Approved by PGCS — Pending Dean Academic",
  passed: "Passed",
  failed: "Failed",
};

export const ATTEMPT_STATUS_COLOR = {
  rpc_pending: "yellow",
  pgcs_pending: "blue",
  dean_pending: "blue",
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

// True once every RPC member has consented but nobody has finalized yet --
// consenting and forwarding are separate actions, so this state is real and
// should read as "ready to move on", not "still pending consensus".
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
  exam_date: PropTypes.string,
  result: PropTypes.string,
  fundamentals_comment: PropTypes.string,
  problem_identification_comment: PropTypes.string,
  plan_of_work_comment: PropTypes.string,
  suggestions_comment: PropTypes.string,
  additional_literature_comment: PropTypes.string,
  milestone_plan_url: PropTypes.string,
  reported_at: PropTypes.string,
  pgcs_remarks: PropTypes.string,
  pgcs_reviewed_at: PropTypes.string,
  dean_approved_at: PropTypes.string,
  consented_count: PropTypes.number,
  committee_size: PropTypes.number,
});

// Shared PropTypes shape for the `exam` objects returned by
// comprehensive_exam_to_dict (backend), reused across the dashboard/modal
// components instead of redefining it in each one.
export const EXAM_SHAPE = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  student_name: PropTypes.string,
  student_roll: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  student_discipline: PropTypes.string,
  semester_no: PropTypes.number,
  status: PropTypes.string,
  current_attempt_number: PropTypes.number,
  max_attempts: PropTypes.number,
  possible_thesis_title: PropTypes.string,
  proposed_exam_date: PropTypes.string,
  entry_qualification: PropTypes.string,
  credits_completed: PropTypes.number,
  required_credits: PropTypes.number,
  current_cpi: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  academic_office_remarks: PropTypes.string,
  dpgc_remarks: PropTypes.string,
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
