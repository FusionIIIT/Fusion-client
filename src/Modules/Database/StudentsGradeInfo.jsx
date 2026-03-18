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
  sanitizeFilename,
} from "./utils/excelExportUtils";
import { host } from "../../routes/globalRoutes";

const students_grade_info_api = `${host}/database/api/students-grade-info/`;

export default function StudentsGradeInfo() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || "ug";

  const programmeTypes = [
    { value: "UG", label: "UG (Undergraduate)" },
    { value: "PG", label: "PG (Postgraduate)" },
    { value: "PHD", label: "PhD (Doctor of Philosophy)" },
  ];

  const currentYear = new Date().getFullYear();
  const batchOptions = Array.from({ length: currentYear - 2020 }, (_, i) => {
    const year = 2021 + i;
    return { value: String(year), label: String(year) };
  });

  const [batch, setBatch] = useState(null);
  const [programmeType, setProgrammeType] = useState("UG");
  const [studentData, setStudentData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showData, setShowData] = useState(false);
  const [exportPreviewOpen, setExportPreviewOpen] = useState(false);
  const [searchRollNo, setSearchRollNo] = useState("");
  const [filterSemester, setFilterSemester] = useState(null);
  const [filterDiscipline, setFilterDiscipline] = useState(null);
  const [searchCourse, setSearchCourse] = useState(null);
  const [courseOptions, setCourseOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [disciplineOptions, setDisciplineOptions] = useState([]);

  // Set programme type based on category from URL
  useEffect(() => {
    const categoryMap = {
      ug: "UG",
      pg: "PG",
      phd: "PHD",
    };
    const mappedType = categoryMap[category] || "UG";
    setProgrammeType(mappedType);
  }, [category]);

  // Reset all data when category changes
  useEffect(() => {
    setBatch(null);
    setStudentData([]);
    setFilteredData([]);
    setCourseOptions([]);
    setSemesterOptions([]);
    setDisciplineOptions([]);
    setSearchRollNo("");
    setFilterSemester(null);
    setFilterDiscipline(null);
    setSearchCourse(null);
    setShowData(false);
    setError(null);
  }, [category]);

  // --- Compute stats live from filteredData ---
  const totalStudents = new Set(filteredData.map((d) => d.roll_no)).size;
  const totalCourses = new Set(filteredData.map((d) => d.course_code)).size;
  const seen = new Set();
  const regularCreditSum = filteredData.reduce((sum, d) => {
    const g = d.grade?.toUpperCase();
    if (!seen.has(d.course_code) && g && g !== "CD" && g !== "NOT SUBMITTED") {
      seen.add(d.course_code);
      return sum + (parseFloat(d.credit) || 0);
    }
    return sum;
  }, 0);
  const backlogImprovementEntries = filteredData.filter(
    (d) =>
      d.registration_type?.toLowerCase() === "backlog" ||
      d.registration_type?.toLowerCase() === "improvement"
  );
  const backlogImprovementCount = backlogImprovementEntries.length;
  const seenBacklog = new Set();
  const backlogImprovementCreditSum = backlogImprovementEntries.reduce((sum, d) => {
    const g = d.grade?.toUpperCase();
    if (!seenBacklog.has(d.course_code) && g && g !== "CD" && g !== "NOT SUBMITTED") {
      seenBacklog.add(d.course_code);
      return sum + (parseFloat(d.credit) || 0);
    }
    return sum;
  }, 0);

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

      // Use export=true to fetch ALL records with no row limit
      const params = new URLSearchParams();
      params.append("batch_id", batch);
      params.append("programme_type", programmeType);
      params.append("export", "true");

      const response = await axios.get(
        `${students_grade_info_api}?${params.toString()}`,
        { headers: { Authorization: `Token ${token}` } }
      );

      const { data } = response;

      if (!data.success) {
        setError(data.error || "Failed to fetch student grade data.");
        setStudentData([]);
        setFilteredData([]);
        setShowData(true);
        setLoading(false);
        return;
      }

      const studentsArray = data.data || [];

      if (!studentsArray || studentsArray.length === 0) {
        setError(data.message || "No student data found for the selected batch.");
        setStudentData([]);
        setFilteredData([]);
        setShowData(true);
        setLoading(false);
        return;
      }

      const processedData = studentsArray.map((student) => ({
        roll_no: student.roll_no || "N/A",
        discipline: student.discipline || "N/A",
        semester_no: student.semester_no || "N/A",
        course_code: student.course_code || "N/A",
        course_name: student.course_name || "N/A",
        credit: student.credit || "N/A",
        grade: student.grade || "Not Submitted",
        registration_type: student.registration_type || "N/A",
      }));

      // Build course dropdown from loaded data
      const uniqueCourses = [
        ...new Set(processedData.map((item) => item.course_code)),
      ]
        .filter((code) => code !== "N/A")
        .sort()
        .map((code) => {
          const course = processedData.find((item) => item.course_code === code);
          return { value: code, label: `${code} - ${course.course_name}` };
        });
      setCourseOptions(uniqueCourses);

      // Build semester dropdown from loaded data
      const uniqueSemesters = [
        ...new Set(processedData.map((item) => String(item.semester_no))),
      ]
        .filter((s) => s !== "N/A")
        .sort((a, b) => Number(a) - Number(b))
        .map((s) => ({ value: s, label: `Semester ${s}` }));
      setSemesterOptions(uniqueSemesters);

      // Build discipline (specialization) dropdown from loaded data
      const uniqueDisciplines = [
        ...new Set(processedData.map((item) => item.discipline)),
      ]
        .filter((d) => d !== "N/A")
        .sort()
        .map((d) => ({ value: d, label: d }));
      setDisciplineOptions(uniqueDisciplines);

      setStudentData(processedData);
      setFilteredData(processedData);
      setShowData(true);

      showNotification({
        title: "Success",
        message: `Loaded ${processedData.length} student grade records successfully.`,
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

    if (filterDiscipline) {
      filtered = filtered.filter((item) => item.discipline === filterDiscipline);
    }

    if (filterSemester) {
      filtered = filtered.filter(
        (item) => String(item.semester_no) === filterSemester
      );
    }

    if (searchRollNo) {
      filtered = filtered.filter((item) =>
        item.roll_no.toLowerCase().includes(searchRollNo.toLowerCase().trim())
      );
    }

    if (searchCourse) {
      filtered = filtered.filter((item) => item.course_code === searchCourse);
    }

    const sorted = [...filtered].sort((a, b) => {
      const rc = a.roll_no.localeCompare(b.roll_no, undefined, { numeric: true });
      if (rc !== 0) return rc;
      const sc = Number(a.semester_no) - Number(b.semester_no);
      if (sc !== 0) return sc;
      return a.course_code.localeCompare(b.course_code);
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
    setFilterDiscipline(null);
    setSearchRollNo("");
    setSearchCourse(null);
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

      const headers = [
        "Roll No",
        "Discipline",
        "Semester No",
        "Course Code",
        "Course Name",
        "Credit",
        "Grade",
        "Registration Type",
      ];

      const rows = dataToExport.map((item) => [
        item.roll_no,
        item.discipline,
        item.semester_no,
        item.course_code,
        item.course_name,
        item.credit,
        item.grade,
        item.registration_type,
      ]);

      const columnWidths = [
        { wch: 10 },
        { wch: 10 },
        { wch: 8 },
        { wch: 10 },
        { wch: 16 },
        { wch: 6 },
        { wch: 10 },
        { wch: 10 },
      ];

      const wb = createStyledWorkbook(headers, rows, columnWidths);
      downloadExcelFile(wb, `Students_Grade_Info_Batch_${batch}`, () => setExportPreviewOpen(false));
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
    setFilterDiscipline(null);
    setSearchRollNo("");
    setSearchCourse(null);
    setCourseOptions([]);
    setSemesterOptions([]);
    setDisciplineOptions([]);
    setStudentData([]);
    setFilteredData([]);
    setShowData(false);
    setError(null);
  };

  // Show blank for PG and PhD (not implemented yet)
  if (category !== "ug") {
    return (
      <Container size="xl" py="xl">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={2} mb="xl">
            Student Grade Info BatchWise
          </Title>
          <Alert color="gray" title="Coming Soon">
            This feature is not yet available for {category.toUpperCase()} students.
          </Alert>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="xl" py="xl">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <LoadingOverlay visible={loading} />
        <Title order={2} mb="xl">
          Student Grade Information BatchWise
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
                View Student Grades for Batch {batch}
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
                <strong>Batch:</strong> {batch} | <strong>All Semesters</strong>
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
                <Select
                  label="Filter by Specialization"
                  placeholder="All Specializations"
                  data={disciplineOptions}
                  value={filterDiscipline}
                  onChange={setFilterDiscipline}
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
                <Select
                  label="Filter by Course"
                  placeholder="All Courses"
                  data={courseOptions}
                  value={searchCourse}
                  onChange={setSearchCourse}
                  searchable
                  clearable
                  nothingFoundMessage="No courses found"
                  mb="lg"
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
                            Total Courses
                          </Text>
                          <Text size="lg" weight={700} color="#2f9e44">
                            {totalCourses}
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
                            Total Credit Sum
                          </Text>
                          <Text size="lg" weight={700} color="#f08c00">
                            {regularCreditSum.toLocaleString()}
                          </Text>
                        </Group>
                      </Box>
                      <Box
                        px="lg"
                        py="sm"
                        style={{
                          backgroundColor: "#ffe0e0",
                          borderRadius: "6px",
                          border: "1px solid #ff9999",
                        }}
                      >
                        <Group position="apart" align="center" spacing="md">
                          <Text size="sm" weight={500} color="#c92a2a">
                            Backlog/Improvement Count
                          </Text>
                          <Text size="lg" weight={700} color="#d63031">
                            {backlogImprovementCount}
                          </Text>
                        </Group>
                      </Box>
                      <Box
                        px="lg"
                        py="sm"
                        style={{
                          backgroundColor: "#ffe0e0",
                          borderRadius: "6px",
                          border: "1px solid #ff9999",
                        }}
                      >
                        <Group position="apart" align="center" spacing="md">
                          <Text size="sm" weight={500} color="#c92a2a">
                            Backlog/Improvement Credit Sum
                          </Text>
                          <Text size="lg" weight={700} color="#d63031">
                            {backlogImprovementCreditSum.toLocaleString()}
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
                        <th>Discipline</th>
                        <th>Semester</th>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>Credit</th>
                        <th>Grade</th>
                        <th>Registration Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData && filteredData.length > 0 ? (
                        filteredData.map((item, index) => (
                          <tr key={`${item.roll_no}-${item.course_code}-${index}`}>
                            <td>{index + 1}</td>
                            <td>
                              <strong>{item.roll_no}</strong>
                            </td>
                            <td>{item.discipline}</td>
                            <td>{item.semester_no}</td>
                            <td>{item.course_code}</td>
                            <td>{item.course_name}</td>
                            <td>{item.credit}</td>
                            <td>
                              <strong>{item.grade}</strong>
                            </td>
                            <td>{item.registration_type}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="9"
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
                          <th>Discipline</th>
                          <th>Sem</th>
                          <th>Course Code</th>
                          <th>Course Name</th>
                          <th>Credit</th>
                          <th>Grade</th>
                          <th>Type</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(filteredData && filteredData.length
                          ? filteredData
                          : studentData
                        )
                          .slice(0, 20)
                          .map((row, idx) => (
                            <tr key={`${row.roll_no}-${row.course_code}-${idx}`}>
                              <td>{idx + 1}</td>
                              <td>{row.roll_no}</td>
                              <td>{row.discipline}</td>
                              <td>{row.semester_no}</td>
                              <td>{row.course_code}</td>
                              <td>{row.course_name}</td>
                              <td>{row.credit}</td>
                              <td>
                                <strong>{row.grade}</strong>
                              </td>
                              <td>{row.registration_type}</td>
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
                  No data found for the selected criteria.
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
