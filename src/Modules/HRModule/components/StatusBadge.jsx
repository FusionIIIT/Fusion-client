import PropTypes from "prop-types";

function StatusBadge({ status }) {
  const colors = {
    PENDING: "bg-yellow-100 text-yellow-800",
    FORWARDED: "bg-blue-100 text-blue-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    CANCELLED: "bg-gray-200 text-gray-800",
    DRAFT: "bg-gray-100 text-gray-800",
    SUBMITTED: "bg-indigo-100 text-indigo-800",
  };
  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || "bg-gray-100"}`}
    >
      {status}
    </span>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string,
};

export default StatusBadge;
