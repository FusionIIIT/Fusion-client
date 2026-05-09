import PropTypes from "prop-types";
import DataTable from "../common/DataTable";

export default function SkillsTable({ skills }) {
  const columns = [
    { key: "skill", label: "Skill" },
    { key: "rating", label: "Rating" },
  ];

  const rows = (skills || []).map((skill) => ({
    key: skill.id || skill.skill_id || skill.skill_name || skill.skill_id__skill,
    cells: [
      { key: "skill", content: skill.skill_name || skill.skill_id__skill || "-" },
      { key: "rating", content: skill.skill_rating },
    ],
  }));

  return <DataTable columns={columns} rows={rows} emptyMessage="No skills added yet" />;
}

SkillsTable.propTypes = {
  skills: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      skill_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      skill_name: PropTypes.string,
      skill_id__skill: PropTypes.string,
      skill_rating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ),
};

SkillsTable.defaultProps = {
  skills: [],
};
