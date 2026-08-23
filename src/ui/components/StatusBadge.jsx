import { Badge } from "@mantine/core";
import PropTypes from "prop-types";

const COLORS = {
  draft: "gray",
  pending: "yellow",
  pending_faculty: "yellow",
  pending_hod: "yellow",
  submitted: "blue",
  under_review: "indigo",
  in_progress: "indigo",
  forwarded: "cyan",
  shortlisted: "violet",
  approved: "green",
  accepted: "green",
  verified: "green",
  published: "green",
  announced: "green",
  active: "green",
  completed: "teal",
  registered: "teal",
  returned: "orange",
  offer_issued: "orange",
  revision: "orange",
  declined: "gray",
  withdrawn: "gray",
  closed: "gray",
  inactive: "gray",
  rejected: "red",
  cancelled: "red",
  failed: "red",
  expired: "red",
};

export function StatusBadge({ status = "" }) {
  const key = String(status ?? "")
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  return (
    <Badge color={COLORS[key] ?? "gray"} variant="light" size="sm">
      {key.replace(/_/g, " ") || "unknown"}
    </Badge>
  );
}

StatusBadge.propTypes = { status: PropTypes.string };

export default StatusBadge;
