import React, { useState, useEffect } from "react";
import {
  TextInput,
  Select,
  Button,
  Grid,
  Card,
  Box,
  LoadingOverlay,
  Alert,
  Table,
  Text,
  Group,
  Title,
  Container,
  Modal,
} from "@mantine/core";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { showNotification } from "@mantine/notifications";
import { Download } from "@phosphor-icons/react";
import {
  createStyledWorkbook,
  downloadExcelFile,
} from "./utils/excelExportUtils";
import {
  DATABASE_APIS,
  generateBatchOptions,
  SEMESTER_OPTIONS_STATIC,
} from "./constants/databaseConstants";

export default function UnregisteredStudents() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || "ug";

  const batchOptions = generateBatchOptions();
  const semesterOptions = SEMESTER_OPTIONS_STATIC;

  const [batch, setBatch] = useState(null);
  const [studentData, setStudentData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showData, setShowData] = useState(false);
  const [exportPreviewOpen, setExportPreviewOpen] = useState(false);
  const [searchRollNo, setSearchRollNo] = useState("");
  const [filterSemester, setFilterSemester] = useState(null);
  const [semesterRange, setSemesterRange] = useState([]);

  useEffect(() => {
    setBatch(null);
    setStudentData([]);
    setFilteredData([]);
    setSemesterRange([]);
    setSearchRollNo("");
    setFilterSemester(null);
    setShowData(false);
    setError(null);
  }, [category]);

  // Compute stats live from filteredData
  const totalStudents = new Set(filteredData.map((d) => d.roll_no)).size;
  const totalSemesterRange = semesterRange.length;
  const unregisteredCount = filteredData.length;

  const handleViewData = async () => {
    if (!batch) {
      setError("Please select a Batch.");
      showNotification({
        title: "Error",
        message: "Please select a batch to view data.",
        color: "red",
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("Authentication token not found. Please login again.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${DATABASE_APIS.UNREGISTERED}?batch_id=${batch}`,
        { headers: { Authorization: `Token ${token}` } },
      );

      const { data } = response;

      if (!data.success) {
        setError(data.error || "Failed to fetch unregistered student data.");
        setStudentData([]);
        setFilteredData([]);
        setShowData(true);
        setLoading(false);
        return;
      }

      const studentsArray = data.data || [];

      if (!studentsArray || studentsArray.length === 0) {
        setError(
          data.message ||
            "No unregistered students found for the selected batch.",
        );
        setStudentData([]);
        setFilteredData([]);
        setShowData(true);
        setLoading(false);
        return;
      }

      const processedData = studentsArray.map((student) => ({
        roll_no: student.roll_no || "N/A",
        student_name: student.student_name || "N/A",
        semester_no: student.semester_no || "N/A",
        batch: student.batch || "N/A",
      }));

      // Use semester_range for display stats only
      const semesterList = data.semester_range || [];
      setSemesterRange(semesterList);

      setStudentData(processedData);
      setFilteredData(processedData);
      setShowData(true);

      showNotification({
        title: "Success",
        message: `Loaded ${processedData.length} unregistered student records successfully.`,
        color: "green",
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || "Unknown error occurred";
      setError(`Error loading data: ${errorMessage}`);
      setStudentData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    let filtered = [...studentData];

    if (filterSemester) {
      // Extract semester number from value like "1_Odd Semester"
      const semesterNum = filterSemester.split("_")[0];
      filtered = filtered.filter(
        (item) => String(item.semester_no) === semesterNum,
      );
    }

    if (searchRollNo) {
      filtered = filtered.filter((item) =>
        item.roll_no.toLowerCase().includes(searchRollNo.toLowerCase().trim()),
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      const rc = a.roll_no.localeCompare(b.roll_no, undefined, {
        numeric: true,
      });
      if (rc !== 0) return rc;
      const sc = Number(a.semester_no) - Number(b.semester_no);
      return sc;
    });

    setFilteredData(sorted);

    if (sorted.length === 0) {
      showNotification({
        title: "No Results",
        message: "No records match the selected filters.",
        color: "yellow",
      });
    }
  };

  const handleResetFilter = () => {
    setFilterSemester(null);
    setSearchRollNo("");
    setFilteredData(studentData);
  };

  const handleExportClick = () => {
    setExportPreviewOpen(true);
  };

  const handleDownloadData = () => {
    try {
      const dataToExport = filteredData.length ? filteredData : studentData;

      if (!dataToExport || dataToExport.length === 0) {
        showNotification({
          title: "Error",
          message: "No data to download.",
          color: "red",
        });
        return;
      }

      const headers = ["Roll No", "Student Name", "Semester", "Batch"];

      const rows = dataToExport.map((item) => [
        item.roll_no,
        item.student_name,
        item.semester_no,
        item.batch,
      ]);

      const columnWidths = [{ wch: 12 }, { wch: 25 }, { wch: 10 }, { wch: 8 }];

      const wb = createStyledWorkbook(headers, rows, columnWidths);
      downloadExcelFile(wb, `Unregistered_Students_Batch_${batch}`, () =>
        setExportPreviewOpen(false),
      );
    } catch (err) {
      console.error("Export error:", err);
      showNotification({
        title: "Export Failed",
        message: err.message || "Failed to export data.",
        color: "red",
      });
    }
  };

  const handleReset = () => {
    setBatch(null);
    setFilterSemester(null);
    setSearchRollNo("");
    setSemesterRange([]);
    setStudentData([]);
    setFilteredData([]);
    setShowData(false);
    setError(null);
  };

  return (
    <Container size="xl" py="xl">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <LoadingOverlay visible={loading} />
        <Title order={2} mb="xl">
          Unregistered Students BatchWise
        </Title>

        {error && (
          <Alert color="red" mb="md" onClose={() => setError(null)} closable>
            {error}
          </Alert>
        )}

        {!showData ? (
          <>
            <Grid>
              <Grid.Col xs={12}>
                <Select
                  label="Batch"
                  placeholder="Select Batch"
                  data={batchOptions}
                  value={batch}
                  onChange={setBatch}
                  disabled={loading}
                  required
                  searchable
                  clearable
                />
              </Grid.Col>
            </Grid>

            {batch ? (
              <Button
                fullWidth
                color="blue"
                size="lg"
                onClick={handleViewData}
                loading={loading}
                disabled={loading}
                mt="xl"
              >
                View Unregistered Students for Batch {batch}
              </Button>
            ) : null}
          </>
        ) : (
          <Box mt="md">
            <Box
              mb="lg"
              p="sm"
              style={{ backgroundColor: "#e7f5ff", borderRadius: "4px" }}
            >
              <Text size="sm">
                <strong>Batch:</strong> {batch} |{" "}
                <strong>Semester Range:</strong> 1 to{" "}
                {semesterRange.length || 0}
              </Text>
            </Box>

            {studentData.length > 0 ? (
              <>
                <Select
                  label="Filter by Semester"
                  placeholder="All Semesters"
                  data={semesterOptions}
                  value={filterSemester}
                  onChange={setFilterSemester}
                  clearable
                  mb="md"
                />
                <TextInput
                  label="Filter by Roll No"
                  placeholder="Enter roll number"
                  value={searchRollNo}
                  onChange={(e) => setSearchRollNo(e.target.value)}
                  mb="md"
                />

                <Grid mb="lg" align="center">
                  <Grid.Col xs={12} md={5}>
                    <Group spacing="xs">
                      <Button onClick={handleFilter} size="sm">
                        Apply Filter
                      </Button>
                      <Button
                        onClick={handleResetFilter}
                        variant="outline"
                        size="sm"
                      >
                        Clear Filter
                      </Button>
                      <Button
                        onClick={handleExportClick}
                        color="green"
                        size="sm"
                        leftSection={<Download size={16} />}
                      >
                        Export
                      </Button>
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        color="blue"
                        size="sm"
                      >
                        Back
                      </Button>
                    </Group>
                  </Grid.Col>
                  <Grid.Col xs={12} md={7}>
                    <Group spacing="xs" position="right">
                      <Box
                        px="lg"
                        py="sm"
                        style={{
                          backgroundColor: "#e7f5ff",
                          borderRadius: "6px",
                          border: "1px solid #74c0fc",
                        }}
                      >
                        <Group position="apart" align="center" spacing="md">
                          <Text size="sm" weight={500} color="#1864ab">
                            Total Students
                          </Text>
                          <Text size="lg" weight={700} color="#1971c2">
                            {totalStudents}
                          </Text>
                        </Group>
                      </Box>
                      <Box
                        px="lg"
                        py="sm"
                        style={{
                          backgroundColor: "#d3f9d8",
                          borderRadius: "6px",
                          border: "1px solid #8ce99a",
                        }}
                      >
                        <Group position="apart" align="center" spacing="md">
                          <Text size="sm" weight={500} color="#2b8a3e">
                            Semester Range
                          </Text>
                          <Text size="lg" weight={700} color="#2f9e44">
                            1 to {totalSemesterRange}
                          </Text>
                        </Group>
                      </Box>
                      <Box
                        px="lg"
                        py="sm"
                        style={{
                          backgroundColor: "#fff3bf",
                          borderRadius: "6px",
                          border: "1px solid #ffd43b",
                        }}
                      >
                        <Group position="apart" align="center" spacing="md">
                          <Text size="sm" weight={500} color="#e67700">
                            Unregistered Count
                          </Text>
                          <Text size="lg" weight={700} color="#f08c00">
                            {unregisteredCount}
                          </Text>
                        </Group>
                      </Box>
                    </Group>
                  </Grid.Col>
                </Grid>

                <Box style={{ overflowX: "auto" }}>
                  <Table highlightOnHover striped>
                    <thead>
                      <tr>
                        <th>S.No.</th>
                        <th>Roll No</th>
                        <th>Student Name</th>
                        <th>Semester</th>
                        <th>Batch</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData && filteredData.length > 0 ? (
                        filteredData.map((item, index) => (
                          <tr
                            key={`${item.roll_no}-${item.semester_no}-${index}`}
                          >
                            <td>{index + 1}</td>
                            <td>
                              <strong>{item.roll_no}</strong>
                            </td>
                            <td>{item.student_name}</td>
                            <td>{item.semester_no}</td>
                            <td>{item.batch}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            style={{ textAlign: "center", padding: "20px" }}
                          >
                            <Text color="dimmed">
                              No records found matching the filter criteria.
                            </Text>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Box>

                <Modal
                  opened={exportPreviewOpen}
                  onClose={() => setExportPreviewOpen(false)}
                  title="Export Preview"
                  size="xl"
                  centered
                >
                  <Text size="sm" mb="sm" c="dimmed">
                    You are about to export the data shown below. Review the
                    preview and click Export to download the file.
                  </Text>
                  <Box style={{ maxHeight: 360, overflowY: "auto" }}>
                    <Table striped highlightOnHover withTableBorder>
                      <thead>
                        <tr>
                          <th>S.No.</th>
                          <th>Roll No</th>
                          <th>Student Name</th>
                          <th>Sem</th>
                          <th>Batch</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(filteredData && filteredData.length
                          ? filteredData
                          : studentData
                        )
                          .slice(0, 20)
                          .map((row, idx) => (
                            <tr
                              key={`${row.roll_no}-${row.semester_no}-${idx}`}
                            >
                              <td>{idx + 1}</td>
                              <td>{row.roll_no}</td>
                              <td>{row.student_name}</td>
                              <td>{row.semester_no}</td>
                              <td>{row.batch}</td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  </Box>
                  <Group mt="md" position="right">
                    <Button
                      variant="default"
                      onClick={() => setExportPreviewOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      leftSection={<Download size={18} />}
                      color="green"
                      onClick={handleDownloadData}
                    >
                      Export Excel
                    </Button>
                  </Group>
                </Modal>
              </>
            ) : (
              <Box p="xl">
                <Text size="lg" color="dimmed" mb="lg">
                  No unregistered students found for the selected criteria.
                </Text>
                <Button
                  variant="outline"
                  color="blue"
                  onClick={handleReset}
                  size="sm"
                >
                  Back
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Card>
    </Container>
  );
}
