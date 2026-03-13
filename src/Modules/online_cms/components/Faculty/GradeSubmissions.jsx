import { useEffect, useMemo, useState } from "react";
import {
  TextInput,
  Button,
  Paper,
  Title,
  Text,
  Stack,
  NumberInput,
  Select,
  Table,
  Group,
  Loader,
  Alert,
  Anchor,
  Badge,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  fetchAllCourses,
  fetchCourseAssignments,
  fetchAssignmentSubmissions,
  gradeSubmission,
} from "../../services/onlineCmsService";

const GRADE_OPTIONS = [
  "A+", "A", "A-",
  "B+", "B", "B-",
  "C+", "C", "C-",
  "D", "F",
];

export default function GradeSubmissions() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [assignmentId, setAssignmentId] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  const [loadingData, setLoadingData] = useState(false);
  const [submissionId, setSubmissionId] = useState("");
  const [grade, setGrade] = useState(null);
  const [loading, setLoading] = useState(false);

  const courseOptions = useMemo(
    () =>
      (Array.isArray(courses) ? courses : []).map((c) => ({
        value: String(c.id),
        label: `${c.title} (#${c.id})`,
      })),
    [courses],
  );

  const assignmentOptions = useMemo(
    () =>
      (Array.isArray(assignments) ? assignments : []).map((a) => ({
        value: String(a.id),
        label: `${a.title} (#${a.id})`,
      })),
    [assignments],
  );

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await fetchAllCourses();
        setCourses(Array.isArray(data) ? data : []);
      } catch (error) {
        notifications.show({
          title: "Error",
          message: error.response?.data?.error || "Failed to load courses.",
          color: "red",
        });
      }
    };
    loadCourses();
  }, []);

  useEffect(() => {
    const loadAssignments = async () => {
      setAssignments([]);
      setAssignmentId(null);
      setSubmissions([]);
      if (!courseId) return;

      setLoadingData(true);
      try {
        const data = await fetchCourseAssignments(courseId);
        setAssignments(Array.isArray(data) ? data : []);
      } catch (error) {
        notifications.show({
          title: "Error",
          message: error.response?.data?.error || "Failed to load assignments.",
          color: "red",
        });
      } finally {
        setLoadingData(false);
      }
    };
    loadAssignments();
  }, [courseId]);

  useEffect(() => {
    const loadSubmissions = async () => {
      setSubmissions([]);
      if (!assignmentId) return;

      setLoadingData(true);
      try {
        const data = await fetchAssignmentSubmissions(assignmentId);
        setSubmissions(Array.isArray(data) ? data : []);
      } catch (error) {
        notifications.show({
          title: "Error",
          message:
            error.response?.data?.error || "Failed to load submissions.",
          color: "red",
        });
      } finally {
        setLoadingData(false);
      }
    };
    loadSubmissions();
  }, [assignmentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submissionId || !grade) {
      notifications.show({
        title: "Validation Error",
        message: "Submission ID and grade are required.",
        color: "orange",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await gradeSubmission({
        submission_id: submissionId,
        grade,
      });
      notifications.show({
        title: "Graded",
        message: `Submission #${result.id} graded "${result.grade}" successfully.`,
        color: "green",
      });
      setSubmissionId("");
      setGrade(null);

      if (assignmentId) {
        const data = await fetchAssignmentSubmissions(assignmentId);
        setSubmissions(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      const msg =
        error.response?.data?.error || "Failed to grade submission.";
      notifications.show({
        title: "Error",
        message: msg,
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper shadow="xs" p="xl" mt="md" withBorder>
      <Title order={4} mb="md">
        Grade Submission
      </Title>
      <Text size="sm" c="dimmed" mb="lg">
        Enter the submission ID (visible in the student&apos;s submission
        record) and assign a letter grade.
      </Text>

      <Stack mb="lg">
        <Select
          label="Course"
          placeholder="Select a course"
          data={courseOptions}
          value={courseId}
          onChange={setCourseId}
          searchable
          clearable
        />
        <Select
          label="Assignment"
          placeholder={courseId ? "Select an assignment" : "Select a course first"}
          data={assignmentOptions}
          value={assignmentId}
          onChange={setAssignmentId}
          searchable
          clearable
          disabled={!courseId}
        />
      </Stack>

      <Title order={5} mb="sm">
        Submissions
      </Title>
      {loadingData && (
        <Group justify="center" py="md">
          <Loader size="sm" />
        </Group>
      )}
      {!loadingData && !assignmentId && (
        <Alert color="blue">Select an assignment to view submissions.</Alert>
      )}
      {!loadingData && assignmentId && submissions.length === 0 && (
        <Alert color="yellow">No submissions for this assignment yet.</Alert>
      )}
      {!loadingData && assignmentId && submissions.length > 0 && (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Student</Table.Th>
              <Table.Th>Link</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Grade</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {submissions.map((s) => (
              <Table.Tr
                key={s.id}
                style={{ cursor: "pointer" }}
                onClick={() => setSubmissionId(String(s.id))}
              >
                <Table.Td>{s.id}</Table.Td>
                <Table.Td>{s.student_username}</Table.Td>
                <Table.Td>
                  <Anchor href={s.file_url} target="_blank" rel="noreferrer">
                    Open
                  </Anchor>
                </Table.Td>
                <Table.Td>
                  <Badge
                    variant="light"
                    color={s.grade_status === "graded" ? "green" : "gray"}
                  >
                    {s.grade_status}
                  </Badge>
                </Table.Td>
                <Table.Td>{s.grade || "—"}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <form onSubmit={handleSubmit}>
        <Stack>
          <NumberInput
            label="Submission ID"
            placeholder="e.g. 5"
            value={submissionId}
            onChange={setSubmissionId}
            min={1}
            required
          />
          <Select
            label="Grade"
            placeholder="Select a grade"
            data={GRADE_OPTIONS}
            value={grade}
            onChange={setGrade}
            required
          />
          <Button type="submit" loading={loading}>
            Submit Grade
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
