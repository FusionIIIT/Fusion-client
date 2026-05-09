import PropTypes from "prop-types";
import DataTable from "../common/DataTable";

export default function InternshipsTable({ internshipsData }) {
  const columns = [
    { key: "organization", label: "Organization" },
    { key: "location", label: "Location" },
    { key: "job", label: "Job Title" },
    { key: "status", label: "Status" },
    { key: "start", label: "Start Date" },
    { key: "end", label: "End Date" },
  ];

  const rows = (internshipsData || []).map((internship) => ({
    key:
      internship.id ||
      `${internship.organization || internship.company || "org"}-${internship.job_title || internship.title || "role"}-${internship.sdate || internship.start_date || "start"}`,
    cells: [
      { key: "organization", content: internship.organization || internship.company || "-" },
      { key: "location", content: internship.location || "-" },
      { key: "job", content: internship.job_title || internship.title || "-" },
      { key: "status", content: internship.status || "-" },
      { key: "start", content: internship.sdate || internship.start_date || "-" },
      { key: "end", content: internship.edate || internship.end_date || "-" },
    ],
  }));

  return <DataTable columns={columns} rows={rows} />;
}

InternshipsTable.propTypes = {
  internshipsData: PropTypes.arrayOf(PropTypes.object),
};

InternshipsTable.defaultProps = {
  internshipsData: [],
};
