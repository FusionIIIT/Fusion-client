export const STATUS = {
  PENDING: "pending",
  REVERTED: "reverted",
  VERIFIED: "verified",
  APPROVED: "approved",
  REJECTED: "rejected"
};

const STATUS_SYNONYMS = {
  submitted: STATUS.PENDING,
  in_review: STATUS.VERIFIED,
  under_review: STATUS.VERIFIED,
  forwarded_to_convenor: STATUS.VERIFIED,
  correction_required: STATUS.REVERTED
};

export const STATUS_LABELS = {
  [STATUS.PENDING]: "Pending",
  [STATUS.REVERTED]: "Reverted",
  [STATUS.VERIFIED]: "Under Review",
  [STATUS.APPROVED]: "Approved",
  [STATUS.REJECTED]: "Rejected"
};

export const STATUS_COLORS = {
  [STATUS.PENDING]: "yellow",
  [STATUS.REVERTED]: "orange",
  [STATUS.VERIFIED]: "blue",
  [STATUS.APPROVED]: "green",
  [STATUS.REJECTED]: "red"
};

export const normalizeStatus = (value) => {
  const normalized = String(value || "").trim().toLowerCase();
  return STATUS_SYNONYMS[normalized] || normalized || STATUS.PENDING;
};
