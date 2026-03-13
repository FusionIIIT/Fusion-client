import { useEffect, useMemo, useState } from "react";
import {
  TextInput,
  Button,
  Paper,
  Title,
  Text,
  Stack,
  Select,
  Group,
  Loader,
  Alert,
  Table,
  Anchor,
  Badge,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  fetchCourseAssignments,
  fetchStudentCourses,
  fetchStudentSubmissions,
  submitAssignment,
} from "../../services/onlineCmsService";

export default function SubmitAssignment() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [assignmentId, setAssignmentId] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);

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
    const load = async () => {
      try {
        const data = await fetchStudentCourses();
        setCourses(Array.isArray(data) ? data : []);
      } catch (error) {
        notifications.show({
          title: "Error",
          message: error.response?.data?.error || "Failed to load enrollments.",
          color: "red",
        });
      } finally {
        setInitialLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadAssignments = async () => {
      setAssignments([]);
      setAssignmentId(null);
      if (!courseId) return;

      setAssignmentsLoading(true);
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
        setAssignmentsLoading(false);
      }
    };

    loadAssignments();
  }, [courseId]);

  const loadSubmissions = async () => {
    setSubmissionsLoading(true);
    try {
      const data = await fetchStudentSubmissions();
      setSubmissions(Array.isArray(data) ? data : []);
    } catch (error) {
      notifications.show({
        title: "Error",
        message:
          error.response?.data?.error || "Failed to load your submissions.",
        color: "red",
      });
    } finally {
      setSubmissionsLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assignmentId || !fileUrl) {
      notifications.show({
        title: "Validation Error",
        message: "Please fill in all fields.",
        color: "orange",
      });
      return;
    }

    setLoading(true);
    try {
      await submitAssignment({
        assignment_id: assignmentId,
        file_url: fileUrl,
      });
      notifications.show({
        title: "Submitted",
        message: `Assignment #${assignmentId} submitted successfully.`,
        color: "green",
      });
      setAssignmentId(null);
      setFileUrl("");

      await loadSubmissions();
    } catch (error) {
      const msg =
        error.response?.data?.error || "Failed to submit assignment.";
      notifications.show({
        title: "Submission Failed",
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
        Submit Assignment
      </Title>
      <Text size="sm" c="dimmed" mb="lg">
        Select a course and assignment, then provide your submission file URL
        (e.g., a link to Google Drive, OneDrive, or GitHub).
      </Text>

      {initialLoading && (
        <Group justify="center" py="md">
          <Loader size="sm" />
        </Group>
      )}

      {!initialLoading && courses.length === 0 && (
        <Alert color="yellow">
          You are not enrolled in any courses yet. Enroll from “Course Catalog”
          first.
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack>
          <Select
            label="Course"
            placeholder="Select a course"
            data={courseOptions}
            value={courseId}
            onChange={setCourseId}
            searchable
            clearable
            disabled={courses.length === 0}
            required
          />

          <Select
            label="Assignment"
            placeholder={
              courseId ? "Select an assignment" : "Select a course first"
            }
            data={assignmentOptions}
            value={assignmentId}
            onChange={setAssignmentId}
            searchable
            clearable
            disabled={!courseId || assignmentsLoading}
            required
          />
          {assignmentsLoading && (
            <Group gap="xs">
              <Loader size="xs" />
              <Text size="xs" c="dimmed">
                Loading assignments…
              </Text>
            </Group>
          )}
          {!assignmentsLoading && courseId && assignments.length === 0 && (
            <Alert color="blue">No assignments available for this course.</Alert>
          )}
          <TextInput
            label="File URL"
            placeholder="https://drive.google.com/..."
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            required
          />
          <Button
            type="submit"
            loading={loading}
            disabled={courses.length === 0}
          >
            Submit Assignment
          </Button>
        </Stack>
      </form>

      <Title order={5} mt="xl" mb="sm">
        My submissions
      </Title>
      {submissionsLoading && (
        <Group justify="center" py="md">
          <Loader size="sm" />
        </Group>
      )}
      {!submissionsLoading && submissions.length === 0 && (
        <Alert color="blue">No submissions yet.</Alert>
      )}
      {!submissionsLoading && submissions.length > 0 && (
        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Assignment</Table.Th>
              <Table.Th>Link</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Grade</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {submissions.map((s) => (
              <Table.Tr key={s.id}>
                <Table.Td>
                  {s.assignment_title || "—"} <Text size="xs" c="dimmed">#{s.id}</Text>
                </Table.Td>
                <Table.Td>
                  <Anchor href={s.file_url} target="_blank" rel="noreferrer">
                    Open
                  </Anchor>
                </Table.Td>
                <Table.Td>
                  <Badge variant="light" color={s.grade_status === "graded" ? "green" : "gray"}>
                    {s.grade_status}
                  </Badge>
                </Table.Td>
                <Table.Td>{s.grade || "—"}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Paper>
  );
}
