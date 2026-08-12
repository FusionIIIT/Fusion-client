import PropTypes from "prop-types";
import {
  Box,
  Button,
  Card,
  Grid,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import {
  Check,
  Download,
  MagnifyingGlass,
  Warning,
} from "@phosphor-icons/react";
import {
  batchYearToAcademicYear,
  getCurrentAcademicYear,
} from "../AdminUpcomingBatchesUtils";
import StudentTable from "./StudentTable";

function StudentListModal({
  opened,
  onClose,
  selectedBatch,
  studentList,
  studentSearchQuery,
  setStudentSearchQuery,
  selectedStudents,
  isAllSelected,
  isBulkReporting,
  updatingReportStatus,
  editingStudent,
  deletingStudent,
  getFilteredStudents,
  handleBulkStatusChange,
  handleSelectAll,
  handleStudentSelect,
  handleReportedStatusChange,
  handleEditStudent,
  handleDeleteStudent,
  setShowExportModal,
  isViewingCurrentYear,
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text size="lg" weight={600} color="#3498db">
          📋 Students in {selectedBatch?.displayBranch || "Branch"} -{" "}
          {selectedBatch?.programme} (
          {selectedBatch
            ? batchYearToAcademicYear(selectedBatch.year)
            : getCurrentAcademicYear()}
          )
        </Text>
      }
      size="90vw"
      centered
      padding="md"
      styles={{
        modal: {
          maxWidth: "95vw",
          maxHeight: "90vh",
        },
        body: {
          padding: "20px",
          maxHeight: "75vh",
          overflow: "auto",
        },
      }}
    >
      <Stack spacing="md">
        {selectedBatch && (
          <Card withBorder padding="md" style={{ backgroundColor: "#f8f9fa" }}>
            <Grid>
              <Grid.Col span={6}>
                <Text size="sm">
                  <strong>Programme:</strong> {selectedBatch.programme}
                </Text>
                <Text size="sm">
                  <strong>Branch:</strong> {selectedBatch.displayBranch}
                </Text>
                <Text size="sm">
                  <strong>Academic Year:</strong>{" "}
                  {selectedBatch
                    ? batchYearToAcademicYear(selectedBatch.year)
                    : getCurrentAcademicYear()}
                </Text>
              </Grid.Col>
              <Grid.Col span={6}>
                <Text size="sm">
                  <strong>Total Seats:</strong> {selectedBatch.totalSeats}
                </Text>
                <Text size="sm">
                  <strong>Filled Seats:</strong> {selectedBatch.filledSeats}
                </Text>
                <Text size="sm">
                  <strong>Available Seats:</strong>{" "}
                  {selectedBatch.availableSeats}
                </Text>
              </Grid.Col>
            </Grid>
          </Card>
        )}

        {/* Search and Export Controls */}
        <Box
          style={{
            backgroundColor: "#f8fafc",
            borderRadius: "8px",
            padding: "20px",
            border: "1px solid #e2e8f0",
          }}
        >
          <Group justify="space-between" align="center">
            <TextInput
              placeholder="Search"
              value={studentSearchQuery}
              onChange={(event) =>
                setStudentSearchQuery(event.currentTarget.value)
              }
              leftSection={<MagnifyingGlass size={18} color="#6b7280" />}
              size="md"
              radius="md"
              style={{
                flex: 1,
                maxWidth: "450px",
                fontSize: "14px",
              }}
              styles={{
                input: {
                  border: "1px solid #d1d5db",
                  backgroundColor: "#ffffff",
                  "&:focus": {
                    borderColor: "#3b82f6",
                    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                  },
                },
              }}
            />
            <Group spacing="md">
              <Text
                size="sm"
                color="#6b7280"
                weight={500}
                style={{ minWidth: "120px" }}
              >
                Showing {getFilteredStudents().length} of {studentList.length}{" "}
                students
              </Text>
              {/* Bulk Status Change Buttons */}
              {isViewingCurrentYear() && selectedStudents.size > 0 && (
                <Group spacing="sm">
                  <Button
                    leftSection={<Check size={18} />}
                    onClick={() => handleBulkStatusChange("REPORTED")}
                    disabled={isBulkReporting}
                    loading={isBulkReporting}
                    variant="filled"
                    color="green"
                    size="md"
                    radius="md"
                    style={{
                      fontWeight: 500,
                      backgroundColor: "#16a34a",
                      minWidth: "130px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Report ({selectedStudents.size})
                  </Button>
                  <Button
                    leftSection={<Warning size={18} />}
                    onClick={() => handleBulkStatusChange("WITHDRAWAL")}
                    disabled={isBulkReporting}
                    loading={isBulkReporting}
                    variant="filled"
                    color="red"
                    size="md"
                    radius="md"
                    style={{
                      fontWeight: 500,
                      backgroundColor: "#dc2626",
                      minWidth: "130px",
                      transition: "all 0.2s ease",
                    }}
                  >
                    Withdraw ({selectedStudents.size})
                  </Button>
                </Group>
              )}
              <Button
                leftSection={<Download size={18} />}
                onClick={() => setShowExportModal(true)}
                disabled={studentList.length === 0}
                variant="filled"
                color="blue"
                size="md"
                radius="md"
                style={{
                  fontWeight: 500,
                  backgroundColor: "#2563eb",
                  minWidth: "140px",
                  transition: "all 0.2s ease",
                }}
              >
                Export Data
              </Button>
            </Group>
          </Group>
        </Box>

        {studentList.length > 0 ? (
          <div
            style={{
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <StudentTable
              getFilteredStudents={getFilteredStudents}
              selectedStudents={selectedStudents}
              isAllSelected={isAllSelected}
              handleSelectAll={handleSelectAll}
              handleStudentSelect={handleStudentSelect}
              updatingReportStatus={updatingReportStatus}
              handleReportedStatusChange={handleReportedStatusChange}
              editingStudent={editingStudent}
              deletingStudent={deletingStudent}
              handleEditStudent={handleEditStudent}
              handleDeleteStudent={handleDeleteStudent}
              isViewingCurrentYear={isViewingCurrentYear}
              selectedBatch={selectedBatch}
            />
          </div>
        ) : (
          <Paper
            padding="xl"
            style={{ textAlign: "center", backgroundColor: "#f8f9fa" }}
          >
            <Text size="lg" color="dimmed">
              No students found in this batch
            </Text>
            <Text size="sm" color="dimmed" mt="xs">
              Students will appear here after they are uploaded and allocated
              roll numbers
            </Text>
          </Paper>
        )}
      </Stack>
    </Modal>
  );
}

StudentListModal.propTypes = {
  opened: PropTypes.bool,
  onClose: PropTypes.func,
  selectedBatch: PropTypes.instanceOf(Object),
  studentList: PropTypes.arrayOf(PropTypes.shape({})),
  studentSearchQuery: PropTypes.string,
  setStudentSearchQuery: PropTypes.func,
  selectedStudents: PropTypes.instanceOf(Set),
  isAllSelected: PropTypes.bool,
  isBulkReporting: PropTypes.bool,
  updatingReportStatus: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  editingStudent: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(Object),
  ]),
  deletingStudent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  getFilteredStudents: PropTypes.func,
  handleBulkStatusChange: PropTypes.func,
  handleSelectAll: PropTypes.func,
  handleStudentSelect: PropTypes.func,
  handleReportedStatusChange: PropTypes.func,
  handleEditStudent: PropTypes.func,
  handleDeleteStudent: PropTypes.func,
  setShowExportModal: PropTypes.func,
  isViewingCurrentYear: PropTypes.func,
};

export default StudentListModal;
