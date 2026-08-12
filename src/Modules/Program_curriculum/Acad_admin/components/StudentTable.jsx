import PropTypes from "prop-types";
import {
  ActionIcon,
  Badge,
  Checkbox,
  Flex,
  ScrollArea,
  Select,
  Table,
} from "@mantine/core";
import { PencilSimple, X } from "@phosphor-icons/react";
import {
  getVisibleColumns,
  getStudentFieldValue,
  getStatusProperties,
  getCurrentProgrammeType,
} from "../AdminUpcomingBatchesUtils";
import { host } from "../../../../routes/globalRoutes";

// Renders one student cell: an image thumbnail for photo/signature columns,
// a badge for the sticky roll-number column, plain text otherwise.
const renderStudentCell = (student, column, colIndex) => {
  const value = getStudentFieldValue(student, column);
  if (column.type === "image") {
    if (!value || value === "-") return "-";
    const src = value.startsWith("http") ? value : `${host}${value}`;
    return (
      <img
        src={src}
        alt={column.label}
        style={{
          height: "40px",
          width: column.key === "signature" ? "70px" : "40px",
          objectFit: "contain",
          borderRadius: "4px",
          border: "1px solid #e2e8f0",
        }}
      />
    );
  }
  if (colIndex === 1 && column.key === "rollNumber") {
    return (
      <Badge color="blue" variant="light" size="sm">
        {value}
      </Badge>
    );
  }
  return value;
};

const getReportedStatusBadge = (status) => {
  const statusProps = getStatusProperties(status);
  return (
    <Badge
      color={statusProps.color}
      variant={statusProps.variant}
      size="xs"
      style={{
        textTransform: "uppercase",
        fontWeight: 600,
      }}
    >
      {statusProps.label}
    </Badge>
  );
};

function StudentTable({
  getFilteredStudents,
  selectedStudents,
  isAllSelected,
  handleSelectAll,
  handleStudentSelect,
  updatingReportStatus,
  handleReportedStatusChange,
  editingStudent,
  deletingStudent,
  handleEditStudent,
  handleDeleteStudent,
  selectedBatch,
}) {
  return (
    <ScrollArea style={{ height: "70vh", width: "100%" }}>
      <Table
        striped
        highlightOnHover
        className="auto-width-table"
        style={{
          minWidth: "1800px",
          fontSize: "13px",
          tableLayout: "auto",
        }}
      >
        <thead style={{ position: "sticky", top: 0, zIndex: 15 }}>
          <tr
            style={{
              backgroundColor: "#f8fafc",
              borderBottom: "2px solid #e2e8f0",
            }}
          >
            {/* S.No Column - Sticky */}
            <th
              style={{
                padding: "16px 12px",
                textAlign: "center",
                color: "#1e293b",
                minWidth: "60px",
                position: "sticky",
                left: "0px",
                backgroundColor: "#f8fafc",
                zIndex: 20,
                borderRight: "2px solid #e2e8f0",
                fontWeight: "bold",
                fontSize: "13px",
                borderBottom: "2px solid #e2e8f0",
              }}
            >
              S.No
            </th>
            {/* Dynamic Column Headers from STUDENT_TABLE_COLUMNS */}
            {getVisibleColumns(
              selectedBatch ? getCurrentProgrammeType(selectedBatch) : "ug",
            ).map((column, index) => (
              <th
                key={column.key}
                style={{
                  padding: "16px 12px",
                  textAlign: "center",
                  color: "#1e293b",
                  minWidth: column.minWidth,
                  fontWeight: "bold",
                  fontSize: "13px",
                  ...(index === 0
                    ? {
                        // JEE Application Number - First sticky column
                        position: "sticky",
                        left: "60px",
                        backgroundColor: "#f8fafc",
                        zIndex: 20,
                        borderRight: "2px solid #e2e8f0",
                        borderBottom: "2px solid #e2e8f0",
                      }
                    : index === 1
                      ? {
                          // Roll Number - Second sticky column
                          position: "sticky",
                          left: "200px",
                          backgroundColor: "#f8fafc",
                          zIndex: 20,
                          borderRight: "2px solid #e2e8f0",
                          borderBottom: "2px solid #e2e8f0",
                        }
                      : {}),
                }}
              >
                {column.label}
              </th>
            ))}
            <th
              style={{
                padding: "16px 12px",
                textAlign: "center",
                color: "#1e293b",
                minWidth: "150px",
                fontWeight: "bold",
                fontSize: "13px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <span>Status</span>
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={selectedStudents.size > 0 && !isAllSelected}
                  onChange={handleSelectAll}
                  size="sm"
                  color="blue"
                  label=""
                  aria-label="Select all students"
                />
              </div>
            </th>
            <th
              style={{
                padding: "16px 12px",
                textAlign: "center",
                color: "#1e293b",
                minWidth: "150px",
                fontWeight: "bold",
                fontSize: "13px",
              }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {getFilteredStudents().map((student, index) => {
            const uniqueKey =
              student.id ||
              student.student_id ||
              student.jee_app_no ||
              student.jeeAppNo ||
              student.roll_number ||
              student.rollNumber ||
              `student_${index}_${student.name}_${student.dob || student.date_of_birth}`;

            return (
              <tr
                key={uniqueKey}
                style={{
                  cursor: "pointer",
                  transition: "background-color 0.2s ease",
                  borderBottom: "1px solid #e5e7eb",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <td
                  style={{
                    padding: "14px 12px",
                    textAlign: "center",
                    position: "sticky",
                    left: "0px",
                    backgroundColor: "#ffffff",
                    zIndex: 10,
                    fontWeight: "bold",
                    borderRight: "2px solid #e5e7eb",
                    fontSize: "13px",
                    color: "#1f2937",
                  }}
                >
                  {index + 1}
                </td>
                {/* Dynamic Data Columns from STUDENT_TABLE_COLUMNS */}
                {getVisibleColumns(
                  selectedBatch ? getCurrentProgrammeType(selectedBatch) : "ug",
                ).map((column, colIndex) => (
                  <td
                    key={column.key}
                    style={{
                      padding: "14px 12px",
                      textAlign:
                        colIndex === 0 || colIndex === 1 ? "left" : "center",
                      fontSize: "12px",
                      color: "#374151",
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                      ...(colIndex === 0
                        ? {
                            // JEE Application Number - First sticky column
                            position: "sticky",
                            left: "60px",
                            backgroundColor: "#ffffff",
                            zIndex: 10,
                            borderRight: "2px solid #e5e7eb",
                            fontSize: "13px",
                            fontWeight: "500",
                            color: "#111827",
                          }
                        : colIndex === 1
                          ? {
                              // Roll Number - Second sticky column
                              position: "sticky",
                              left: "200px",
                              backgroundColor: "#ffffff",
                              zIndex: 10,
                              borderRight: "2px solid #e5e7eb",
                              fontSize: "13px",
                              fontWeight: "500",
                              color: "#111827",
                            }
                          : {}),
                    }}
                  >
                    {renderStudentCell(student, column, colIndex)}
                  </td>
                ))}

                {/* Status and Actions Columns */}
                <td
                  style={{
                    padding: "14px 12px",
                    textAlign: "center",
                    fontSize: "12px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    {getReportedStatusBadge(
                      student.reportedStatus ||
                        student.reported_status ||
                        "NOT_REPORTED",
                    )}
                    <Checkbox
                      checked={selectedStudents.has(
                        student.id || student.student_id,
                      )}
                      onChange={() =>
                        handleStudentSelect(student.id || student.student_id)
                      }
                      size="sm"
                      color="blue"
                      aria-label={`Select student ${student.name || student.rollNumber || student.roll_number}`}
                    />
                  </div>
                </td>
                <td
                  style={{
                    padding: "14px 12px",
                    textAlign: "center",
                    fontSize: "12px",
                  }}
                >
                  <Flex gap="8px" justify="center" align="center">
                    <Select
                      data={[
                        { value: "REPORTED", label: "Reported" },
                        { value: "NOT_REPORTED", label: "Not Reported" },
                        { value: "WITHDRAWAL", label: "Withdrawal" },
                      ]}
                      value={
                        student.reportedStatus ||
                        student.reported_status ||
                        "NOT_REPORTED"
                      }
                      onChange={(value) =>
                        handleReportedStatusChange(
                          student.id || student.student_id,
                          value,
                        )
                      }
                      size="xs"
                      variant="filled"
                      disabled={
                        updatingReportStatus ===
                        (student.id || student.student_id)
                      }
                      style={{ minWidth: "100px" }}
                    />
                    <ActionIcon
                      size="sm"
                      variant="outline"
                      color="blue"
                      loading={
                        editingStudent === (student.id || student.student_id)
                      }
                      onClick={() => handleEditStudent(student)}
                      style={{
                        borderRadius: "6px",
                      }}
                    >
                      <PencilSimple size={14} />
                    </ActionIcon>
                    <ActionIcon
                      size="sm"
                      variant="outline"
                      color="red"
                      loading={
                        deletingStudent === (student.id || student.student_id)
                      }
                      onClick={() => handleDeleteStudent(student)}
                      style={{
                        borderRadius: "6px",
                      }}
                    >
                      <X size={14} />
                    </ActionIcon>
                  </Flex>
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </ScrollArea>
  );
}

StudentTable.propTypes = {
  getFilteredStudents: PropTypes.func,
  selectedStudents: PropTypes.instanceOf(Set),
  isAllSelected: PropTypes.bool,
  handleSelectAll: PropTypes.func,
  handleStudentSelect: PropTypes.func,
  updatingReportStatus: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  handleReportedStatusChange: PropTypes.func,
  editingStudent: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Object),
  ]),
  deletingStudent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  handleEditStudent: PropTypes.func,
  handleDeleteStudent: PropTypes.func,
  selectedBatch: PropTypes.instanceOf(Object),
};

export default StudentTable;
