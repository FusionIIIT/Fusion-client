import React, { useState, useEffect } from "react";
import {
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
import { host } from "../../routes/globalRoutes";

// API endpoint for course student count
const course_student_count_api = `${host}/database/api/course-student-count/`;
const course_students_api = `${host}/database/api/course-students/`;

export default function CourseWiseStudentEnrollment() {
  const [searchParams] = useSearchParams();
  const category = searchParams.get("category") || "ug";

  const semesterTypes = [
    { value: "Odd Semester", label: "Odd Semester" },
    { value: "Even Semester", label: "Even Semester" },
    { value: "Summer Semester", label: "Summer Semester" },
  ];

  const [year, setYear] = useState("");
  const [semesterType, setSemesterType] = useState("");
  const [programmeType, setProgrammeType] = useState("UG");
  const [courseFilter, setCourseFilter] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [academicYears, setAcademicYears] = useState([]);
  const [courseFilterOptions, setCourseFilterOptions] = useState([]);
  const [databaseData, setDatabaseData] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [error, setError] = useState(null);
  const [showData, setShowData] = useState(false);
  const [exportPreviewOpen, setExportPreviewOpen] = useState(false);
  const [courseStudents, setCourseStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [specializationOptions, setSpecializationOptions] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState("All");
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    const categoryMap = {
      ug: "UG",
      pg: "PG",
      phd: "PHD",
    };
    const mappedType = categoryMap[category] || "UG";
    setProgrammeType(mappedType);
  }, [category]);

  useEffect(() => {
    setYear("");
    setSemesterType("");
    setCourseFilter("");
    setSelectedCourse("All");
    setDatabaseData([]);
    setFilteredData([]);
    setCourseOptions([]);
    setCourseFilterOptions([]);
    setCourseStudents([]);
    setFilteredStudents([]);
    setSpecializationOptions([]);
    setSelectedSpecialization("All");
    setShowData(false);
    setError(null);
  }, [category]);

  // Fetch academic years on component mount
  useEffect(() => {
    async function fetchAcademicYears() {
      setLoading(true);
      setError("");
      try {
        // Generate academic years from 2021-22 to current academic year
        // Academic year resets in July (month 6 in 0-indexed)
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        const academicYear = currentMonth >= 6 ? currentYear : currentYear - 1;
        const years = Array.from({ length: academicYear - 2020 }, (_, i) => {
          const y = 2021 + i;
          return `${y}-${String(y + 1).slice(-2)}`;
        });
        setAcademicYears(
          years.map((y) => ({
            value: y,
            label: y,
          })),
        );
      } catch {
        setError("Failed to load academic years.");
      } finally {
        setLoading(false);
      }
    }
    fetchAcademicYears();
  }, []);

  // Fetch available courses when year, semester, and programme are selected
  useEffect(() => {
    if (!year || !semesterType || !programmeType) {
      setCourseFilterOptions([]);
      setCourseFilter("");
      return;
    }

    async function fetchCourses() {
      setLoadingCourses(true);
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          setCourseFilterOptions([]);
          return;
        }

        const params = new URLSearchParams();
        params.append("session", year);
        params.append("semester_type", semesterType);
        params.append("programme_type", programmeType);

        const { data } = await axios.get(
          `${course_student_count_api}?${params.toString()}`,
          {
            headers: { Authorization: `Token ${token}` },
          },
        );

        if (data && data.courses && data.courses.length > 0) {
          // Deduplicate courses by code
          const uniqueCourses = Array.from(
            new Map(data.courses.map((c) => [c.code, c])).values(),
          );

          const courseOpts = [
            { value: "", label: "All Courses" },
            ...uniqueCourses.map((c) => ({
              value: c.code,
              label: `${c.code} - ${c.name}`,
            })),
          ];
          setCourseFilterOptions(courseOpts);
        } else {
          setCourseFilterOptions([]);
        }
      } catch (err) {
        console.error("Error fetching courses:", err);
        setCourseFilterOptions([]);
      } finally {
        setLoadingCourses(false);
      }
    }

    fetchCourses();
  }, [year, semesterType, programmeType]);

  const handleViewDatabase = async () => {
    if (!year || !semesterType || !programmeType) {
      setError(
        "Please select academic year, semester type, and programme type.",
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("No authentication token found!");
        setLoading(false);
        return;
      }

      const params = new URLSearchParams();
      params.append("session", year);
      params.append("semester_type", semesterType);
      params.append("programme_type", programmeType);

      if (courseFilter) {
        params.append("code", courseFilter);
      }

      const { data } = await axios.get(
        `${course_student_count_api}?${params.toString()}`,
        {
          headers: { Authorization: `Token ${token}` },
        },
      );

      // Ensure we have courses data
      if (!data || !data.courses || data.courses.length === 0) {
        setError("No courses found for the selected criteria.");
        setDatabaseData([]);
        setShowData(true);
        setLoading(false);
        return;
      }

      // Process and sort the courses data
      const summary = data.courses
        .map((c) => {
          const count =
            c.student_count !== undefined && c.student_count !== null
              ? parseInt(c.student_count, 10)
              : 0;

          return {
            academic_year: c.academic_year || year,
            semester_type: c.semester_type || semesterType,
            course_code: c.code || "N/A",
            course_name: c.name || "N/A",
            credit: c.credit || "N/A",
            student_count: count,
          };
        })
        .sort((a, b) => a.course_code.localeCompare(b.course_code));

      const uniqueSummary = Array.from(
        new Map(summary.map((c) => [c.course_code, c])).values(),
      );

      const courseOpts = [
        { value: "All", label: "All Courses" },
        ...uniqueSummary.map((c) => ({
          value: c.course_code,
          label: `${c.course_code} - ${c.course_name}`,
        })),
      ];
      setCourseOptions(courseOpts);
      setDatabaseData(uniqueSummary);
      setFilteredData(uniqueSummary);
      setSelectedCourse("All");
      setShowData(true);
      showNotification({
        title: "Success",
        message: `Loaded ${summary.length} courses successfully.`,
        color: "green",
      });
    } catch (err) {
      console.error("Error loading database:", err);
      const errorMessage =
        err.response?.data?.error || err.message || "Unknown error occurred";
      setError(`Error loading database: ${errorMessage}`);
      setDatabaseData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDatabase = () => {
    try {
      const isStudentExport =
        selectedCourse &&
        selectedCourse !== "All" &&
        filteredStudents.length > 0;

      let headers;
      let rows;
      let filename;
      let columnWidths;

      if (isStudentExport) {
        headers = [
          "Roll No",
          "Discipline",
          "Course Code",
          "Course Name",
          "Credit",
        ];
        rows = filteredStudents.map((s) => [
          s.roll_no,
          s.discipline,
          s.course_code,
          s.course_name,
          s.credit,
        ]);
        filename = `Students_${selectedCourse}_${new Date().getFullYear()}_${semesterType.replace(/ /g, "_")}`;
        columnWidths = [
          { wch: 12 }, // Roll No
          { wch: 12 }, // Discipline
          { wch: 12 }, // Course Code
          { wch: 25 }, // Course Name
          { wch: 8 }, // Credit
        ];
      } else {
        const dataToExport =
          filteredData && filteredData.length ? filteredData : databaseData;
        if (!dataToExport || dataToExport.length === 0) {
          setError("No data to download.");
          return;
        }
        headers = [
          "Academic Year",
          "Semester Type",
          "Course Code",
          "Course Name",
          "Credit",
          "Student Count",
        ];
        rows = dataToExport.map((item) => [
          item.academic_year,
          item.semester_type,
          item.course_code,
          item.course_name,
          item.credit,
          item.student_count,
        ]);
        filename = `CourseWise_Student_Summary_${year}_${semesterType.replace(/ /g, "_")}`;
        columnWidths = [
          { wch: 12 },
          { wch: 14 },
          { wch: 12 },
          { wch: 22 },
          { wch: 8 },
          { wch: 12 },
        ];
      }

      const wb = createStyledWorkbook(headers, rows, columnWidths);
      downloadExcelFile(wb, filename, () => setExportPreviewOpen(false));
    } catch (err) {
      console.error("Export error:", err);
      showNotification({
        title: "Export Failed",
        message: err.message || "Failed to export data.",
        color: "red",
      });
    }
  };

  const handleCourseFilter = async (courseCode) => {
    setSelectedCourse(courseCode);
    setSelectedSpecialization("All");
    setCourseStudents([]);
    setFilteredStudents([]);
    setSpecializationOptions([]);

    if (courseCode === "All" || !courseCode) {
      setFilteredData(databaseData);
      return;
    }

    setFilteredData(
      databaseData.filter((item) => item.course_code === courseCode),
    );

    setLoadingStudents(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        showNotification({
          title: "Error",
          message: "Authentication token not found. Please login again.",
          color: "red",
        });
        return;
      }
      const params = new URLSearchParams({
        session: year,
        semester_type: semesterType,
        course_code: courseCode,
        programme_type: programmeType,
      });
      const { data } = await axios.get(
        `${course_students_api}?${params.toString()}`,
        {
          headers: { Authorization: `Token ${token}` },
        },
      );
      const students = data.students || [];
      setCourseStudents(students);
      setFilteredStudents(students);
      const disciplines = [
        "All",
        ...new Set(students.map((s) => s.discipline).filter(Boolean)),
      ];
      setSpecializationOptions(
        disciplines.map((d) => ({ value: d, label: d })),
      );
    } catch (err) {
      console.error("Error fetching course students:", err);
      showNotification({
        title: "Error",
        message: "Failed to fetch course students. Please try again.",
        color: "red",
      });
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleSpecializationFilter = (spec) => {
    setSelectedSpecialization(spec);
    if (spec === "All") {
      setFilteredStudents(courseStudents);
    } else {
      setFilteredStudents(courseStudents.filter((s) => s.discipline === spec));
    }
  };

  const handleReset = () => {
    const categoryMap = {
      ug: "UG",
      pg: "PG",
      phd: "PHD",
    };

    setYear("");
    setSemesterType("");
    setProgrammeType(categoryMap[category] || "UG");
    setCourseFilter("");
    setSelectedCourse("All");
    setDatabaseData([]);
    setFilteredData([]);
    setCourseOptions([]);
    setCourseFilterOptions([]);
    setCourseStudents([]);
    setFilteredStudents([]);
    setSpecializationOptions([]);
    setSelectedSpecialization("All");
    setShowData(false);
    setError(null);
  };

  // Block access for PhD (component not available)
  if (category === "phd") {
    return (
      <Container size="xl" py="xl">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={2} mb="xl">
            Course-wise Student Count
          </Title>
          <Alert color="gray" title="Coming Soon">
            This feature is not yet available for PhD students.
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
          Course-wise Student Count
        </Title>

        {error && (
          <Alert color="red" mb="md" onClose={() => setError(null)} closable>
            {error}
          </Alert>
        )}

        {!showData ? (
          <>
            <Grid>
              <Grid.Col xs={12} sm={6}>
                <Select
                  label="Academic Year"
                  placeholder="Select Academic Year"
                  data={academicYears}
                  value={year}
                  onChange={setYear}
                  disabled={loading}
                  required
                  searchable
                />
              </Grid.Col>
              <Grid.Col xs={12} sm={6}>
                <Select
                  label="Semester Type"
                  placeholder="Select Semester Type"
                  data={semesterTypes}
                  value={semesterType}
                  onChange={setSemesterType}
                  disabled={loading}
                  required
                />
              </Grid.Col>
              <Grid.Col xs={12}>
                <Select
                  label="Course"
                  placeholder="Select a course or view all"
                  data={courseFilterOptions}
                  value={courseFilter}
                  onChange={setCourseFilter}
                  disabled={
                    loadingCourses || !year || !semesterType || !programmeType
                  }
                  searchable
                  clearable
                />
              </Grid.Col>
            </Grid>

            {year && semesterType && programmeType ? (
              <Button
                fullWidth
                color="blue"
                size="lg"
                onClick={handleViewDatabase}
                loading={loading}
                disabled={loading}
                mt="xl"
              >
                Course-wise Student Count
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
                <strong>Academic Year:</strong> {year} |{" "}
                <strong>Semester:</strong> {semesterType} |{" "}
                <strong>Programme:</strong> {programmeType}
              </Text>
            </Box>

            {databaseData.length > 0 ? (
              <>
                <Select
                  label="Filter by Course"
                  placeholder="Select a course"
                  data={courseOptions}
                  value={selectedCourse}
                  onChange={handleCourseFilter}
                  disabled={loading}
                  searchable
                  mb="lg"
                />

                {selectedCourse &&
                  selectedCourse !== "All" &&
                  specializationOptions.length > 0 && (
                    <Select
                      label="Filter by Specialization"
                      placeholder="Select specialization"
                      data={specializationOptions}
                      value={selectedSpecialization}
                      onChange={handleSpecializationFilter}
                      disabled={loadingStudents}
                      mb="lg"
                    />
                  )}

                <Grid mb="lg" align="center">
                  <Grid.Col xs={12} md={5}>
                    <Group spacing="xs">
                      <Button
                        leftSection={<Download size={20} />}
                        color="green"
                        onClick={() => setExportPreviewOpen(true)}
                        loading={loading}
                        size="sm"
                      >
                        Export
                      </Button>
                      <Button
                        variant="outline"
                        color="blue"
                        onClick={handleReset}
                        loading={loading}
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
                            {filteredData.length}
                          </Text>
                        </Group>
                      </Box>
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
                            {selectedCourse && selectedCourse !== "All"
                              ? filteredStudents.length
                              : filteredData.reduce(
                                  (acc, item) => acc + item.student_count,
                                  0,
                                )}
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
                        {selectedCourse && selectedCourse !== "All" ? (
                          <>
                            <th>Roll No</th>
                            <th>Discipline</th>
                            <th>Course Code</th>
                            <th>Course Name</th>
                            <th>Credit</th>
                          </>
                        ) : (
                          <>
                            <th>Course Code</th>
                            <th>Course Name</th>
                            <th>Credit</th>
                            <th>Student Count</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCourse && selectedCourse !== "All"
                        ? filteredStudents.map((item, index) => (
                            <tr
                              key={`${item.roll_no}-${item.course_code}-${index}`}
                            >
                              <td>{index + 1}</td>
                              <td>
                                <strong>{item.roll_no}</strong>
                              </td>
                              <td>{item.discipline}</td>
                              <td>{item.course_code}</td>
                              <td>{item.course_name}</td>
                              <td>{item.credit}</td>
                            </tr>
                          ))
                        : filteredData.map((item, index) => (
                            <tr key={`${item.course_code}-${index}`}>
                              <td>{index + 1}</td>
                              <td>
                                <strong>{item.course_code}</strong>
                              </td>
                              <td>{item.course_name}</td>
                              <td>{item.credit}</td>
                              <td>
                                <strong>{item.student_count}</strong>
                              </td>
                            </tr>
                          ))}
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
                          {selectedCourse &&
                          selectedCourse !== "All" &&
                          filteredStudents.length > 0 ? (
                            <>
                              <th>Roll No</th>
                              <th>Discipline</th>
                              <th>Course Code</th>
                              <th>Course Name</th>
                              <th>Credit</th>
                            </>
                          ) : (
                            <>
                              <th>Course Code</th>
                              <th>Course Name</th>
                              <th>Credits</th>
                              <th>Student Count</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCourse &&
                        selectedCourse !== "All" &&
                        filteredStudents.length > 0
                          ? filteredStudents.slice(0, 20).map((row, idx) => (
                              <tr
                                key={`${row.roll_no}-${row.course_code}-${idx}`}
                              >
                                <td>{idx + 1}</td>
                                <td>{row.roll_no}</td>
                                <td>{row.discipline}</td>
                                <td>{row.course_code}</td>
                                <td>{row.course_name}</td>
                                <td>{row.credit}</td>
                              </tr>
                            ))
                          : (filteredData && filteredData.length
                              ? filteredData
                              : databaseData
                            )
                              .slice(0, 20)
                              .map((row, idx) => (
                                <tr key={`${row.course_code}-${idx}`}>
                                  <td>{idx + 1}</td>
                                  <td>{row.course_code}</td>
                                  <td>{row.course_name}</td>
                                  <td>{row.credit}</td>
                                  <td>{row.student_count}</td>
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
                      onClick={handleDownloadDatabase}
                    >
                      Export Excel
                    </Button>
                  </Group>
                </Modal>
              </>
            ) : (
              <>
                <Alert color="yellow" mb="md">
                  No data available for the selected criteria.
                </Alert>
                <Group>
                  <Button
                    variant="outline"
                    color="blue"
                    onClick={handleReset}
                    loading={loading}
                    size="sm"
                  >
                    Back
                  </Button>
                </Group>
              </>
            )}
          </Box>
        )}
      </Card>
    </Container>
  );
}
