export const getStatusColor = (status) => {
  switch (status) {
    case "Submitted":
    case "Resubmitted":
      return "blue";
    case "Director's Approval Received":
    case "Patent Filed":
    case "Patent Granted":
    case "Approved":
    case "Appeal Approved":
      return "green";
    case "Forwarded for Director's Review":
    case "Forwarded to Director":
    case "Patentability Search Report Generated":
    case "Under Review":
      return "orange";
    case "Draft":
      return "yellow";
    case "Rejected":
    case "Patent Refused":
    case "Appeal Rejected":
      return "red";
    case "Needs Revision":
    case "Modification Requested":
      return "pink";
    case "Appeal":
    case "Appeal Under Review":
      return "violet";
    default:
      return "gray";
  }
};
