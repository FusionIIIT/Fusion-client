import PropTypes from "prop-types";
import DataTable from "../common/DataTable";

export default function ProjectsTable({ projectsData }) {
  const columns = [
    { key: "name", label: "Project Name" },
    { key: "status", label: "Status" },
    { key: "link", label: "Project Link" },
    { key: "start", label: "Start Date" },
    { key: "end", label: "End Date" },
  ];

  const rows = (projectsData || []).map((project) => ({
    key:
      project.id ||
      `${project.project_name || "project"}-${project.project_link || "link"}`,
    cells: [
      { key: "name", content: project.project_name || "-" },
      { key: "status", content: project.status || project.project_status || "-" },
      {
        key: "link",
        content: project.project_link ? (
          <a href={project.project_link} target="_blank" rel="noopener noreferrer">
            {project.project_link}
          </a>
        ) : (
          "-"
        ),
      },
      { key: "start", content: project.start_date || project.sdate || "-" },
      { key: "end", content: project.end_date || project.edate || "-" },
    ],
  }));

  return <DataTable columns={columns} rows={rows} />;
}

ProjectsTable.propTypes = {
  projectsData: PropTypes.arrayOf(PropTypes.object),
};

ProjectsTable.defaultProps = {
  projectsData: [],
};
