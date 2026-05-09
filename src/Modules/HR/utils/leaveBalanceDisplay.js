/**
 * Display helpers for HR2 leave form + ``/hr2/leave/balance/`` API.
 *
 * Defaults for **allotted** when HR creates a ``LeaveBalance`` row mirror
 * ``applications.hr2.models.LeaveBalance`` Field defaults (casual 15, special casual 7,
 * earned 30, restricted holiday 2; commuted / station / vacation allotments default 0).
 */

/** Rows for “Days applied”: one HR2 leave request applies exactly one leave type. */
const APPLIED_ROW_DEFS = [
  {
    type: "Casual Leave",
    match: (c) => c.includes("casual") && !c.includes("special"),
  },
  { type: "Vacation Leave", match: (c) => c.includes("vacation") },
  { type: "Earned Leave", match: (c) => c.includes("earned") },
  { type: "Commuted Leave", match: (c) => c.includes("commuted") },
  {
    type: "Special Casual Leave",
    match: (c) => c.includes("special") && c.includes("casual"),
  },
  { type: "Restricted Holiday", match: (c) => c.includes("restricted") },
  { type: "Half Pay Leave", match: (c) => c.includes("half") && c.includes("pay") },
  { type: "Maternity Leave", match: (c) => c.includes("maternity") },
  { type: "Child Care Leave", match: (c) => c.includes("child") && c.includes("care") },
  { type: "Paternity Leave", match: (c) => c.includes("paternity") },
];

/** Snapshot keys returned by ``CheckLeaveBalance.get`` (leave_balance_summary). */
const BALANCE_LEDGER_ROWS = [
  { type: "Casual Leave", key: "casual_leave" },
  { type: "Special Casual Leave", key: "special_casual_leave" },
  { type: "Earned Leave", key: "earned_leave" },
  { type: "Commuted Leave", key: "commuted_leave" },
  { type: "Restricted Holiday", key: "restricted_holiday" },
  { type: "Station Leave", key: "station_leave" },
  { type: "Vacation Leave", key: "vacation_leave" },
];

/** Types not stored on ``hr2.LeaveBalance`` — show placeholder in UI. */
const BALANCE_EXTRA_ROWS = [
  { type: "Half Pay Leave" },
  { type: "Maternity Leave" },
  { type: "Child Care Leave" },
  { type: "Paternity Leave" },
];

function calendarInclusiveDays(isoStart, isoEnd) {
  if (isoStart == null || isoEnd == null || isoStart === "" || isoEnd === "") {
    return null;
  }
  const s = String(isoStart).slice(0, 10);
  const e = String(isoEnd).slice(0, 10);
  const a = new Date(`${s}T12:00:00`);
  const b = new Date(`${e}T12:00:00`);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
  const diff = Math.round((b - a) / 86400000) + 1;
  return diff > 0 ? diff : null;
}

/**
 * @param {object} form — normalized leave form (category + ``applied_leave_days`` or date range)
 */
export function buildLeaveTypesAppliedRows(form) {
  const raw = form?.applied_leave_days;
  let days = raw != null && raw !== "" ? Number(raw) : Number.NaN;
  if (!Number.isFinite(days)) {
    const est = calendarInclusiveDays(form?.leaveStartDate, form?.leaveEndDate);
    days = est != null ? est : 0;
  }
  const d = days;
  const cat = String(
    form?.leave_balance_category || form?.natureOfLeave || "",
  ).toLowerCase();

  return APPLIED_ROW_DEFS.map(({ type, match }) => ({
    type,
    applied: match(cat) ? d : 0,
  }));
}

/**
 * @param {object|null} summary — ``leave_balance`` object from API (or null if fetch failed)
 */
export function buildAllLeaveBalanceRows(summary) {
  const ledger = BALANCE_LEDGER_ROWS.map(({ type, key }) => {
    const block = summary?.[key];
    const b = block?.balance;
    return {
      type,
      balance: b != null && b !== "" ? String(b) : "—",
    };
  });
  const extra = BALANCE_EXTRA_ROWS.map(({ type }) => ({
    type,
    balance: "—",
  }));
  return [...ledger, ...extra];
}

export const leaveBalanceDefaultsHint =
  "Balances come from the HR2 leave ledger (get or create on first use). New rows use model defaults: casual 15, special casual 7, earned 30, restricted holiday 2; commuted, station, and vacation allotments start at 0 until HR sets them. Half pay, maternity, child care, and paternity are not stored on this ledger, so they show as — here.";
