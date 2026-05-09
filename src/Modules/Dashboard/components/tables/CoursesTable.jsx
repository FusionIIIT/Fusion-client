import PropTypes from "prop-types";
import DataTable from "../common/DataTable";

export default function CoursesTable({ coursesData }) {
  const columns = [
    { key: "course", label: "Course Name" },
    { key: "license", label: "License No." },
    { key: "start", label: "Start Date" },
    { key: "end", label: "Completion Date" },
  ];

  const rows = (coursesData || []).map((course) => ({
    key:
      course.id ||
      `${course.course_name || "course"}-${course.license_no || course.license || "license"}`,
    cells: [
      { key: "course", content: course.course_name || "-" },
      { key: "license", content: course.license_no || course.license || "-" },
      { key: "start", content: course.sdate || course.start_date || "-" },
      { key: "end", content: course.edate || course.end_date || "-" },
    ],
  }));

  return <DataTable columns={columns} rows={rows} />;
}

CoursesTable.propTypes = {
  coursesData: PropTypes.arrayOf(PropTypes.object),
};

CoursesTable.defaultProps = {
  coursesData: [],
};
