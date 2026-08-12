import PropTypes from "prop-types";
import {
  Table,
  Select,
  Badge,
  TextInput,
  Text,
  Button,
  ActionIcon,
  Group,
} from "@mantine/core";
import { PencilSimple, Check, X } from "@phosphor-icons/react";
import {
  getDisciplineOptions,
  getDisplayBranchName,
} from "../AdminUpcomingBatchesUtils";

const HEAD_CELL = {
  padding: "15px 20px",
  backgroundColor: "#C5E2F6",
  color: "#3498db",
  fontSize: "16px",
  textAlign: "center",
  borderRight: "1px solid #d3d3d3",
};
const BODY_CELL = {
  padding: "15px 20px",
  textAlign: "center",
  color: "black",
  borderRight: "1px solid #d3d3d3",
};

// Batch listing table. Rows open the student modal on click; inline-row edit
// (editingRow/editFormData) is wired here and activated from the parent.
function BatchTable({
  batches,
  loading,
  editingRow,
  editFormData,
  setEditFormData,
  onRowClick,
  getProgrammeOptions,
  onEditClick,
  onSaveEdit,
  onCancelEdit,
  savingEdit,
}) {
  return (
    <Table style={{ backgroundColor: "white", padding: "20px", width: "100%" }}>
      <thead>
        <tr>
          <th style={HEAD_CELL}>Name</th>
          <th style={HEAD_CELL}>Discipline</th>
          <th style={HEAD_CELL}>Batch Year</th>
          <th style={HEAD_CELL}>Curriculum</th>
          <th style={HEAD_CELL}>Total Seats</th>
          <th style={HEAD_CELL}>Filled Seats</th>
          <th style={HEAD_CELL}>Available Seats</th>
          <th style={{ ...HEAD_CELL, borderRight: "none" }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {batches.length > 0 ? (
          batches.map((batch, index) => (
            <tr
              key={batch.id || `batch-${index}`}
              style={{
                cursor: editingRow === batch.id ? "default" : "pointer",
                transition: "background-color 0.2s ease",
              }}
              onClick={
                editingRow === batch.id ? undefined : () => onRowClick(batch)
              }
              onMouseEnter={
                editingRow === batch.id
                  ? undefined
                  : (e) => {
                      e.target.closest("tr").style.backgroundColor = "#f8f9fa";
                    }
              }
              onMouseLeave={
                editingRow === batch.id
                  ? undefined
                  : (e) => {
                      e.target.closest("tr").style.backgroundColor =
                        "transparent";
                    }
              }
            >
              <td style={BODY_CELL}>
                {editingRow === batch.id ? (
                  <Select
                    value={editFormData.programme}
                    onChange={(value) =>
                      setEditFormData({ ...editFormData, programme: value })
                    }
                    data={getProgrammeOptions()}
                    size="sm"
                    style={{ minWidth: "120px" }}
                  />
                ) : (
                  batch.name || batch.programme
                )}
              </td>
              <td style={BODY_CELL}>
                {editingRow === batch.id ? (
                  <Select
                    value={editFormData.discipline}
                    onChange={(value) =>
                      setEditFormData({ ...editFormData, discipline: value })
                    }
                    data={getDisciplineOptions(editFormData.programme)}
                    size="sm"
                    style={{ minWidth: "200px" }}
                  />
                ) : (
                  <Badge variant="light" color="blue">
                    {batch.displayBranch ||
                      getDisplayBranchName(batch.discipline)}
                  </Badge>
                )}
              </td>
              <td style={BODY_CELL}>
                {editingRow === batch.id ? (
                  <TextInput
                    value={editFormData.year}
                    onChange={(event) =>
                      setEditFormData({
                        ...editFormData,
                        year: event.currentTarget.value,
                      })
                    }
                    size="sm"
                    style={{ width: "100px" }}
                    type="number"
                    min="2020"
                    max="2030"
                  />
                ) : (
                  batch.year
                )}
              </td>
              <td style={BODY_CELL}>
                <Badge variant="light" color="cyan" size="sm">
                  {(() => {
                    const display =
                      batch.curriculum_display ||
                      batch.curriculum ||
                      batch.curriculum_name ||
                      "N/A";
                    const version =
                      batch.curriculumVersion || batch.curriculum_version;
                    function hasVersionInfo(displayValue, versionValue) {
                      if (!versionValue) return false;
                      const regex = new RegExp(
                        `\\bv?\\s*${versionValue}\\b`,
                        "i",
                      );
                      return regex.test(displayValue);
                    }
                    if (version && !hasVersionInfo(display, version)) {
                      return `${display} v${version}`;
                    }
                    return display;
                  })()}
                </Badge>
              </td>
              <td style={{ ...BODY_CELL, fontWeight: "500" }}>
                {editingRow === batch.id ? (
                  <TextInput
                    value={editFormData.totalSeats}
                    onChange={(event) =>
                      setEditFormData({
                        ...editFormData,
                        totalSeats: event.currentTarget.value,
                      })
                    }
                    size="sm"
                    style={{ width: "100px" }}
                    type="number"
                    min="0"
                    max="500"
                  />
                ) : (
                  <Text weight={500}>{batch.totalSeats}</Text>
                )}
              </td>
              <td
                style={{
                  ...BODY_CELL,
                  color: batch.filledSeats > 0 ? "#16a34a" : "#6b7280",
                  position: "relative",
                }}
              >
                <div>{batch.filledSeats}</div>
              </td>
              <td
                style={{
                  ...BODY_CELL,
                  color: batch.availableSeats > 0 ? "green" : "red",
                  fontWeight: "500",
                }}
              >
                {batch.availableSeats}
              </td>
              <td style={{ ...BODY_CELL, borderRight: "none" }}>
                {editingRow === batch.id ? (
                  <Group gap="xs" justify="center" wrap="nowrap">
                    <ActionIcon
                      color="green"
                      variant="light"
                      loading={savingEdit}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSaveEdit();
                      }}
                      aria-label="Save batch"
                    >
                      <Check size={16} />
                    </ActionIcon>
                    <ActionIcon
                      color="gray"
                      variant="light"
                      disabled={savingEdit}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCancelEdit();
                      }}
                      aria-label="Cancel edit"
                    >
                      <X size={16} />
                    </ActionIcon>
                  </Group>
                ) : (
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<PencilSimple size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditClick(batch);
                    }}
                  >
                    Edit
                  </Button>
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan="8"
              style={{ padding: "30px", textAlign: "center", color: "#666" }}
            >
              {loading
                ? "Loading batch data..."
                : "No batches found matching your criteria"}
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}

BatchTable.propTypes = {
  batches: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  loading: PropTypes.bool,
  editingRow: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  editFormData: PropTypes.instanceOf(Object),
  setEditFormData: PropTypes.func,
  onRowClick: PropTypes.func.isRequired,
  getProgrammeOptions: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired,
  onSaveEdit: PropTypes.func.isRequired,
  onCancelEdit: PropTypes.func.isRequired,
  savingEdit: PropTypes.bool,
};

export default BatchTable;
