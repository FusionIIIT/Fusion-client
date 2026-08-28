import React, { useState, useMemo } from "react";
import {
  Card,
  Text,
  Button,
  TextInput,
  Alert,
  Loader,
  Select,
  Tabs,
  Table,
  Badge,
  Group,
  ScrollArea,
  Divider,
  Modal,
  Stack,
  Box,
} from "@mantine/core";
import {
  IconDownload,
  IconEye,
  IconArchive,
  IconSearch,
} from "@tabler/icons-react";
import axios from "axios";
import { useSelector } from "react-redux";
import { allowedProgrammeChoices } from "../../ui/nav/roles";
import { courseLabel } from "../../lib/course";
import {
  checkAllocationRoute,
  startAllocationRoute,
  addCourseToSlotsRoute,
  allocationResultsRoute,
  exportAllocationCourseRoute,
  exportAllAllocationCoursesRoute,
} from "../../routes/academicRoutes";

/* ── helpers ── */
const CURRENT_YEAR = new Date().getFullYear();

const yearOptions = Array.from({ length: CURRENT_YEAR - 2021 + 1 }, (_, i) => {
  const y = String(CURRENT_YEAR - i);
  return { value: y, label: y };
});

const semesterOptions = Array.from({ length: 8 }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

/* ── component ── */
function AllocateCourses() {
  const [batch, setBatch] = useState(null);
  const [semester, setSemester] = useState(null);
  const [year, setYear] = useState(null);
  const userRole = useSelector((state) => state.user.role);
  const programmeChoices = allowedProgrammeChoices(userRole, [
    { value: "UG", label: "Undergraduate (UG)" },
    { value: "PG", label: "Postgraduate (PG)" },
    { value: "PHD", label: "PhD" },
  ]);
  const [programmeType, setProgrammeType] = useState(
    programmeChoices[0]?.value ?? "UG",
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showStartButton, setShowStartButton] = useState(false);
  const [continueAllocation, setContinueAllocation] = useState(false);
  const [allocationResults, setAllocationResults] = useState(null);
  const [resultsLoading, setResultsLoading] = useState(false);
  const [previewCourse, setPreviewCourse] = useState(null);
  const [exportingId, setExportingId] = useState(null);
  const [exportingAll, setExportingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [slotIssues, setSlotIssues] = useState(null);
  const [skippedCourseIds, setSkippedCourseIds] = useState([]);

  const getToken = () => localStorage.getItem("authToken");

  const triggerDownload = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", filename);
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const fetchAllocationResults = async () => {
    setResultsLoading(true);
    try {
      const res = await axios.post(
        allocationResultsRoute,
        { batch, sem: semester, year, programme_type: programmeType },
        { headers: { Authorization: `Token ${getToken()}` } },
      );
      if (res.data.status === 1) {
        setAllocationResults(res.data);
        setSearchQuery("");
      }
    } catch {
      /* silent */
    }
    setResultsLoading(false);
  };

  const handleCheckAllocation = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    setShowStartButton(false);
    setContinueAllocation(false);
    setAllocationResults(null);
    setSearchQuery("");

    const tok = getToken();
    if (!tok) {
      setError("No token found");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        checkAllocationRoute,
        { batch, sem: semester, year, programme_type: programmeType },
        {
          headers: {
            Authorization: `Token ${tok}`,
            "Content-Type": "application/json",
          },
        },
      );
      const r = res.data;
      if (r.status === 2) {
        setSuccess("Courses are successfully allocated.");
        setLoading(false); // stop this spinner before the results spinner starts
        await fetchAllocationResults();
        return;
      }
      if (r.status === 1) {
        setContinueAllocation((r.allocated_allocations || 0) > 0);
        setError(r.message || "Courses not yet allocated. Start allocation.");
        setShowStartButton(true);
      } else if (r.status === -1) {
        setError("Registration is under process.");
      } else if (r.status === -2) {
        setError("Registration didn't start.");
      } else {
        setError(r.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error checking allocation.");
    }
    setLoading(false);
  };

  /* 409 means a course is missing from its slot and nothing was allocated */
  const runAllocation = async (skipList) => {
    setLoading(true);
    setSuccess("");
    setError("");
    setAllocationResults(null);
    setSearchQuery("");

    const tok = getToken();
    if (!tok) {
      setError("No token found");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        startAllocationRoute,
        {
          batch,
          semester,
          year,
          programme_type: programmeType,
          skip_course_ids: skipList,
        },
        {
          headers: {
            Authorization: `Token ${tok}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (res.data.status === 1) {
        setSlotIssues(null);
        const remaining = res.data.progress?.remaining_allocations || 0;
        if (remaining > 0) {
          setError(
            res.data.message || "Some students still require allocation.",
          );
          setSuccess("");
          setContinueAllocation(true);
          setShowStartButton(true);
        } else {
          setSuccess(res.data.message || "Course allocation successful!");
          setShowStartButton(false);
          setContinueAllocation(false);
        }
        // stop this spinner before the results spinner starts
        setLoading(false);
        await fetchAllocationResults();
        return;
      }
      setError(res.data.message || "Allocation failed");
    } catch (err) {
      const data = err.response?.data;
      if (err.response?.status === 409 && data?.needs_action?.length) {
        setSlotIssues(data.needs_action);
      } else {
        setError(
          data?.message ||
            data?.error ||
            `Error starting allocation (HTTP ${err.response?.status ?? "?"}).`,
        );
      }
    }
    setLoading(false);
  };

  const handleStartAllocation = () => {
    setSkippedCourseIds([]);
    setSlotIssues(null);
    return runAllocation([]);
  };

  const handleAddToSlots = async (issue) => {
    const pending = slotIssues;
    setSlotIssues(null);
    setError("");
    try {
      await axios.post(
        addCourseToSlotsRoute,
        {
          course_id: issue.course_id,
          slot_ids: issue.missing_from.map((m) => m.slot_id),
        },
        {
          headers: {
            Authorization: `Token ${getToken()}`,
            "Content-Type": "application/json",
          },
        },
      );
      await runAllocation(skippedCourseIds);
    } catch (err) {
      setSlotIssues(pending); // reopen so it can be retried or skipped
      setError(
        err.response?.data?.message ||
          `Could not add ${issue.course_code} to its slots.`,
      );
    }
  };

  const handleSkipCourse = async (issue) => {
    setSlotIssues(null);
    setError("");
    const nextSkips = [...new Set([...skippedCourseIds, issue.course_id])];
    setSkippedCourseIds(nextSkips);
    await runAllocation(nextSkips);
  };

  const handleExportCourse = async (course) => {
    setExportingId(course.course_db_id);
    try {
      const res = await axios.post(
        exportAllocationCourseRoute,
        {
          batch,
          sem: semester,
          year,
          programme_type: programmeType,
          course_db_id: course.course_db_id,
        },
        {
          headers: { Authorization: `Token ${getToken()}` },
          responseType: "blob",
        },
      );
      triggerDownload(
        new Blob([res.data]),
        `${batch}_Sem${semester}_${course.course_code}.xlsx`,
      );
    } catch {
      /* silent */
    }
    setExportingId(null);
  };

  const handleExportAll = async () => {
    setExportingAll(true);
    try {
      const res = await axios.post(
        exportAllAllocationCoursesRoute,
        { batch, sem: semester, year, programme_type: programmeType },
        {
          headers: { Authorization: `Token ${getToken()}` },
          responseType: "blob",
        },
      );
      triggerDownload(
        new Blob([res.data]),
        `${batch}_Sem${semester}_AllCourses.zip`,
      );
    } catch {
      /* silent */
    }
    setExportingAll(false);
  };

  /* ── filtered data (global search) ── */
  const q = searchQuery.toLowerCase().trim();

  const filteredStudents = useMemo(() => {
    if (!allocationResults) return [];
    const rows = allocationResults.student_wise;
    if (!q) return rows;
    return rows.filter((row) => {
      const courseText = row.courses
        .map((c) => `${c.code} ${c.name}`)
        .join(" ")
        .toLowerCase();
      return (
        row.student_id.toLowerCase().includes(q) ||
        row.student_name.toLowerCase().includes(q) ||
        String(row.batch).includes(q) ||
        courseText.includes(q)
      );
    });
  }, [allocationResults, q]);

  const filteredCourses = useMemo(() => {
    if (!allocationResults) return [];
    const courses = allocationResults.course_wise;
    if (!q) return courses;
    return courses.filter((c) => {
      const stuText = c.students
        .map(
          (s) =>
            `${s.roll_no} ${s.full_name} ${s.discipline} ${s.email} ${s.registration_type}`,
        )
        .join(" ")
        .toLowerCase();
      return (
        c.course_code.toLowerCase().includes(q) ||
        c.course_name.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        stuText.includes(q)
      );
    });
  }, [allocationResults, q]);

  /* ── Student-wise tab ── */
  const renderStudentWise = () => {
    if (!filteredStudents.length)
      return (
        <Text c="dimmed" mt="sm">
          {q ? "No results match your search." : "No records found."}
        </Text>
      );
    return (
      <ScrollArea mt="sm">
        <Table
          striped
          highlightOnHover
          withBorder
          withColumnBorders
          fontSize="sm"
        >
          <thead>
            <tr>
              <th style={{ width: 60 }}>S. No</th>
              <th>Student ID</th>
              <th>Name</th>
              <th>Batch</th>
              <th>Allocated Courses</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((row, idx) => (
              <tr key={row.student_id}>
                <td>{idx + 1}</td>
                <td>{row.student_id}</td>
                <td>{row.student_name}</td>
                <td>{row.batch}</td>
                <td>
                  <Group gap={4} noWrap={false}>
                    {row.courses.map((c) => (
                      <Badge key={c.code} variant="outline" size="sm">
                        {courseLabel(c)}
                      </Badge>
                    ))}
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ScrollArea>
    );
  };

  /* ── Course-wise tab ── */
  const renderCourseWise = () => {
    if (!filteredCourses.length)
      return (
        <Text c="dimmed" mt="sm">
          {q ? "No results match your search." : "No records found."}
        </Text>
      );

    return (
      <>
        <Group justify="flex-end" mb="sm">
          <Button
            color="teal"
            leftSection={<IconArchive size={15} />}
            loading={exportingAll}
            onClick={handleExportAll}
          >
            Export All ({allocationResults.course_wise.length} courses)
          </Button>
        </Group>

        <Stack gap="sm">
          {filteredCourses.map((course, idx) => (
            <Card key={course.course_db_id} withBorder p="sm" radius="md">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Text fw={600} style={{ wordBreak: "break-word" }}>
                    <Text component="span" c="dimmed" fw={400} mr={6}>
                      {idx + 1}.
                    </Text>
                    {course.course_code} — {course.course_name}
                  </Text>
                  <Text size="xs" c="dimmed" mt={2}>
                    Instructor: {course.instructor} &nbsp;|&nbsp;{" "}
                    {course.students.length} students &nbsp;|&nbsp;{" "}
                    {allocationResults.semester_type},{" "}
                    {allocationResults.academic_year}
                  </Text>
                </div>
                <Stack gap={6} style={{ flexShrink: 0 }}>
                  <Button
                    size="xs"
                    variant="light"
                    leftSection={<IconEye size={13} />}
                    onClick={() => setPreviewCourse(course)}
                    style={{ minWidth: 120 }}
                  >
                    Preview
                  </Button>
                  <Button
                    size="xs"
                    color="green"
                    leftSection={<IconDownload size={13} />}
                    loading={exportingId === course.course_db_id}
                    onClick={() => handleExportCourse(course)}
                    style={{ minWidth: 120 }}
                  >
                    Export Excel
                  </Button>
                </Stack>
              </div>
            </Card>
          ))}
        </Stack>
      </>
    );
  };

  /* ── Courses missing from their course slot ── */
  const renderSlotIssuesModal = () => {
    if (!slotIssues?.length) return null;

    return (
      <Modal
        opened={!!slotIssues?.length}
        onClose={() => setSlotIssues(null)}
        size="lg"
        title={
          <Text fw={700} c="red.7">
            Courses missing from their course slot
          </Text>
        }
      >
        <Stack gap="md">
          <Alert color="yellow" variant="light">
            Nothing has been allocated yet. These courses were registered under
            a slot that does not list them, so allocation would put students in
            a slot their course does not belong to. Add each course to its slot,
            or skip it.
          </Alert>

          {slotIssues.map((issue) => (
            <Card
              key={`${issue.course_id}-${issue.slot_name}`}
              withBorder
              padding="sm"
            >
              <Stack gap="xs">
                <Group justify="space-between" wrap="nowrap">
                  <div>
                    <Text fw={600}>
                      {issue.course_code} — {issue.course_name}
                    </Text>
                    <Text size="sm" c="dimmed">
                      slot {issue.slot_name} ({issue.slot_type}) · sem{" "}
                      {issue.missing_from[0]?.semester_no}
                    </Text>
                  </div>
                  <Badge color="red" variant="light">
                    {issue.students} student{issue.students === 1 ? "" : "s"}
                  </Badge>
                </Group>

                <div>
                  <Text size="sm" mb={4}>
                    Missing from {issue.missing_from.length} curriculum slot
                    {issue.missing_from.length === 1 ? "" : "s"}:
                  </Text>
                  <Group gap="xs">
                    {issue.missing_from.map((m) => (
                      <Badge key={m.slot_id} variant="outline" color="gray">
                        {m.curriculum_name} ({m.students})
                      </Badge>
                    ))}
                  </Group>
                </div>

                <Group justify="flex-end" gap="sm">
                  <Button
                    size="xs"
                    variant="light"
                    color="red"
                    onClick={() => handleSkipCourse(issue)}
                  >
                    Skip this course
                  </Button>
                  <Button size="xs" onClick={() => handleAddToSlots(issue)}>
                    Add to slots
                  </Button>
                </Group>
              </Stack>
            </Card>
          ))}

          <Text size="xs" c="dimmed">
            Add to slots writes the course into those slots and re-runs
            allocation. Skip drops it for every student — they fall through to
            their next priority choice, and in a single-choice slot they get
            nothing.
          </Text>
        </Stack>
      </Modal>
    );
  };

  /* ── Course preview modal ── */
  const renderPreviewModal = () => {
    if (!previewCourse) return null;
    const { course_code, course_name, instructor, students } = previewCourse;
    const { semester_type, academic_year, programme_type } = allocationResults;

    return (
      <Modal
        opened={!!previewCourse}
        onClose={() => setPreviewCourse(null)}
        size="90%"
        styles={{
          body: {
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            height: "85vh",
          },
        }}
        title={
          <Text fw={700} c="blue" size="md">
            {programme_type} All Registration Types Student List Preview
          </Text>
        }
      >
        <Stack gap={2} mb="xs" align="center">
          <Text fw={700} c="blue" ta="center" size="sm">
            PDPM INDIAN INSTITUTE OF INFORMATION TECHNOLOGY, DESIGN AND
            MANUFACTURING JABALPUR
          </Text>
          <Text fw={600} ta="center" size="sm">
            {semester_type.toUpperCase()}, {academic_year}
          </Text>
        </Stack>

        <Divider mb="xs" />

        <Stack gap={2} mb="sm">
          <Text size="sm">Course No.: {course_code}</Text>
          <Text size="sm">Course Title: {course_name}</Text>
          <Text size="sm">Instructor: {instructor}</Text>
          <Text size="sm" c="blue">
            List Type: {programme_type} - Complete Roll List (All Registration
            Types)
          </Text>
        </Stack>

        <Box style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
          <Table
            striped
            highlightOnHover
            withBorder
            withColumnBorders
            fontSize="xs"
            style={{ tableLayout: "fixed", width: "100%" }}
          >
            <thead
              style={{
                position: "sticky",
                top: 0,
                background: "#fff",
                zIndex: 1,
              }}
            >
              <tr>
                <th style={{ width: 50 }}>S. No</th>
                <th style={{ width: 110 }}>Roll No</th>
                <th>Name</th>
                <th style={{ width: 90 }}>Discipline</th>
                <th>Email</th>
                <th style={{ width: 110 }}>Reg. Type</th>
                <th style={{ width: 90 }}>Signature</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, idx) => (
                <tr key={s.roll_no}>
                  <td>{idx + 1}</td>
                  <td>{s.roll_no}</td>
                  <td>{s.full_name}</td>
                  <td>{s.discipline}</td>
                  <td style={{ wordBreak: "break-all", fontSize: 11 }}>
                    {s.email}
                  </td>
                  <td>{s.registration_type}</td>
                  <td aria-label="Signature" />
                </tr>
              ))}
            </tbody>
          </Table>
        </Box>

        <Group justify="flex-end" mt="sm" style={{ flexShrink: 0 }}>
          <Button
            color="green"
            leftSection={<IconDownload size={14} />}
            loading={exportingId === previewCourse.course_db_id}
            onClick={() => handleExportCourse(previewCourse)}
          >
            Export Excel
          </Button>
        </Group>
      </Modal>
    );
  };

  /* ── main render ── */
  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      {/* 2-column × 2-row form grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: 24,
        }}
      >
        <Select
          label="Programme Type"
          placeholder="Select programme type"
          value={programmeType}
          onChange={setProgrammeType}
          data={programmeChoices}
        />
        <Select
          label="Batch"
          placeholder="Select batch"
          value={batch}
          onChange={setBatch}
          data={yearOptions}
          searchable
        />
        <Select
          label="Semester"
          placeholder="Select semester"
          value={semester}
          onChange={setSemester}
          data={semesterOptions}
        />
        <Select
          label="Year"
          placeholder="Select year"
          value={year}
          onChange={setYear}
          data={yearOptions}
          searchable
        />
      </div>

      <Button
        fullWidth
        style={{ backgroundColor: "#3B82F6", color: "white" }}
        onClick={handleCheckAllocation}
        mb="md"
      >
        Check Allocation
      </Button>

      {loading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "1rem",
          }}
        >
          <Loader variant="dots" />
        </div>
      )}

      {error && (
        <Alert title="Notice" color="red" mt="lg">
          {error}
        </Alert>
      )}

      {success && (
        <Alert title="Success" color="green" mt="lg">
          {success}
        </Alert>
      )}

      {showStartButton && (
        <Button
          fullWidth
          style={{ backgroundColor: "#4CBB17", color: "white" }}
          mt="md"
          onClick={handleStartAllocation}
          loading={loading}
        >
          {continueAllocation ? "Continue Allocation" : "Start Allocation"}
        </Button>
      )}

      {resultsLoading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "1.5rem",
          }}
        >
          <Loader variant="dots" />
        </div>
      )}

      {allocationResults && !resultsLoading && (
        <>
          <Divider
            mt="xl"
            mb="md"
            label={`Allocation Results — ${allocationResults.semester_type}, ${allocationResults.academic_year} | Batch ${batch}`}
            labelPosition="center"
          />

          {/* Global search bar */}
          <TextInput
            placeholder="Search students, courses, disciplines, emails…"
            leftSection={<IconSearch size={15} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            mb="md"
          />

          <Tabs defaultValue="student">
            <Tabs.List>
              <Tabs.Tab value="student">
                Student-wise ({filteredStudents.length}
                {q &&
                allocationResults.student_wise.length !==
                  filteredStudents.length
                  ? ` of ${allocationResults.student_wise.length}`
                  : ""}{" "}
                students)
              </Tabs.Tab>
              <Tabs.Tab value="course">
                Course-wise ({filteredCourses.length}
                {q &&
                allocationResults.course_wise.length !== filteredCourses.length
                  ? ` of ${allocationResults.course_wise.length}`
                  : ""}{" "}
                courses)
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="student" pt="sm">
              {renderStudentWise()}
            </Tabs.Panel>

            <Tabs.Panel value="course" pt="sm">
              {renderCourseWise()}
            </Tabs.Panel>
          </Tabs>
        </>
      )}

      {renderSlotIssuesModal()}
      {renderPreviewModal()}
    </Card>
  );
}

export default AllocateCourses;
