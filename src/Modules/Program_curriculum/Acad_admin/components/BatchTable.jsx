import PropTypes from "prop-types";
import { Table, Badge, Text } from "@mantine/core";
import { getDisplayBranchName } from "../AdminUpcomingBatchesUtils";

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

// Batch listing table. Rows open the student modal on click.
function BatchTable({ batches, loading, onRowClick }) {
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
          <th style={{ ...HEAD_CELL, borderRight: "none" }}>Available Seats</th>
        </tr>
      </thead>
      <tbody>
        {batches.length > 0 ? (
          batches.map((batch, index) => (
            <tr
              key={batch.id || `batch-${index}`}
              style={{
                cursor: "pointer",
                transition: "background-color 0.2s ease",
              }}
              onClick={() => onRowClick(batch)}
              onMouseEnter={(e) => {
                e.target.closest("tr").style.backgroundColor = "#f8f9fa";
              }}
              onMouseLeave={(e) => {
                e.target.closest("tr").style.backgroundColor = "transparent";
              }}
            >
              <td style={BODY_CELL}>{batch.name || batch.programme}</td>
              <td style={BODY_CELL}>
                <Badge variant="light" color="blue">
                  {batch.displayBranch ||
                    getDisplayBranchName(batch.discipline)}
                </Badge>
              </td>
              <td style={BODY_CELL}>{batch.year}</td>
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
                <Text weight={500}>{batch.totalSeats}</Text>
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
                  borderRight: "none",
                  color: batch.availableSeats > 0 ? "green" : "red",
                  fontWeight: "500",
                }}
              >
                {batch.availableSeats}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan="7"
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
  onRowClick: PropTypes.func.isRequired,
};

export default BatchTable;
