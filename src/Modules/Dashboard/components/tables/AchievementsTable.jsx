import PropTypes from "prop-types";
import DataTable from "../common/DataTable";

export default function AchievementsTable({ achievements }) {
  const columns = [
    { key: "type", label: "Type" },
    { key: "date", label: "Date" },
    { key: "issuer", label: "Issuer" },
    { key: "description", label: "Description" },
  ];

  const rows = (achievements || []).map((ach) => ({
    key:
      ach.id ||
      `${ach.achievement_type || ach.type || "type"}-${ach.date_earned || ach.date || "date"}-${ach.issuer || "issuer"}`,
    cells: [
      { key: "type", content: ach.achievement_type || ach.type || "-" },
      { key: "date", content: ach.date_earned || ach.date || "-" },
      { key: "issuer", content: ach.issuer || "-" },
      { key: "description", content: ach.description || "-" },
    ],
  }));

  return <DataTable columns={columns} rows={rows} emptyMessage="No achievements added yet." />;
}

AchievementsTable.propTypes = {
  achievements: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      achievement_type: PropTypes.string,
      date_earned: PropTypes.string,
      issuer: PropTypes.string,
      description: PropTypes.string,
    }),
  ),
};

AchievementsTable.defaultProps = {
  achievements: [],
};
