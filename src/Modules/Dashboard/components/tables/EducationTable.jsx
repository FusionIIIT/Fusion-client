import PropTypes from "prop-types";
import DataTable from "../common/DataTable";

export default function EducationTable({ educationData }) {
  const columns = [
    { key: "degree", label: "Degree" },
    { key: "stream", label: "Stream" },
    { key: "institute", label: "Institute" },
    { key: "grade", label: "Grade" },
    { key: "start", label: "Start Date" },
    { key: "end", label: "End Date" },
  ];

  const rows = (educationData || []).map((edu) => ({
    key: edu.id || `${edu.degree || "degree"}-${edu.institute || "inst"}-${edu.sdate || "start"}`,
    cells: [
      { key: "degree", content: edu.degree || "-" },
      { key: "stream", content: edu.stream || "-" },
      { key: "institute", content: edu.institute || "-" },
      { key: "grade", content: edu.grade || "-" },
      { key: "start", content: edu.sdate || edu.start_date || "-" },
      { key: "end", content: edu.edate || edu.end_date || "-" },
    ],
  }));

  return <DataTable columns={columns} rows={rows} />;
}

EducationTable.propTypes = {
  educationData: PropTypes.arrayOf(PropTypes.object),
};

EducationTable.defaultProps = {
  educationData: [],
};
