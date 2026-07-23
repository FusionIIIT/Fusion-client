import React, { memo, useMemo } from "react";
import PropTypes from "prop-types";
import { Table, Select, Text } from "@mantine/core";

const RPCCommitteeTable = memo(function RPCCommitteeTable({
  supervisor,
  coSupervisor,
  facultyOptions,
  committee,
  onChange,
  readOnly,
}) {
  const fixedMembers = useMemo(() => {
    return [
      supervisor?.id && {
        name: supervisor.name,
        discipline: supervisor.discipline,
      },
      coSupervisor?.id && {
        name: coSupervisor.name,
        discipline: coSupervisor.discipline,
      },
    ].filter(Boolean);
  }, [supervisor, coSupervisor]);

  const numSelectables = 5 - fixedMembers.length;

  const handleSelectionChange = (index, value) => {
    const updated = [...committee];
    updated[index] = value;
    onChange(updated);
  };

  return (
    <Table striped highlightOnHover aria-label="RPC Committee Members">
      <thead>
        <tr>
          <th scope="col">Faculty</th>
          <th scope="col">Discipline</th>
        </tr>
      </thead>
      <tbody>
        {fixedMembers.map((m, idx) => (
          <tr key={`fixed-${idx}`}>
            <td>
              <Text size="sm">{m.name}</Text>
            </td>
            <td>
              <Text size="sm">{m.discipline}</Text>
            </td>
          </tr>
        ))}
        {Array.from({ length: numSelectables }).map((_, i) => {
          const val = committee[i] || null;
          const selectedFaculty = facultyOptions.find((f) => f.value === val);
          const label = selectedFaculty?.label || "";
          const discipline = selectedFaculty?.discipline || "";

          // Exclude the fixed Supervisor/Co-Supervisor and whoever is already
          // picked in another committee slot, so the same faculty member
          // can't be selected twice across this table.
          const excludedIds = [
            supervisor?.id,
            coSupervisor?.id,
            ...committee.filter((_v, j) => j !== i),
          ];
          const availableOptions = facultyOptions.filter(
            (f) => f.value === val || !excludedIds.includes(f.value),
          );

          return (
            <tr key={`select-${i}`}>
              <td>
                {readOnly ? (
                  <Text size="sm">{label || "-"}</Text>
                ) : (
                  <Select
                    data={availableOptions}
                    value={val}
                    onChange={(v) => handleSelectionChange(i, v)}
                    placeholder="Select faculty"
                    clearable
                    size="sm"
                    aria-label={`Select committee member ${i + 1}`}
                  />
                )}
              </td>
              <td>
                <Text size="sm">{discipline || "-"}</Text>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
});

RPCCommitteeTable.propTypes = {
  supervisor: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    discipline: PropTypes.string,
  }),
  coSupervisor: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    discipline: PropTypes.string,
  }),
  facultyOptions: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        .isRequired,
      label: PropTypes.string.isRequired,
      discipline: PropTypes.string,
    }),
  ).isRequired,
  committee: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  ).isRequired,
  onChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
};

RPCCommitteeTable.defaultProps = {
  supervisor: null,
  coSupervisor: null,
  readOnly: false,
};

RPCCommitteeTable.displayName = "RPCCommitteeTable";

export default RPCCommitteeTable;
