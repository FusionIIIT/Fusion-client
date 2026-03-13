import { useEffect, useMemo, useState } from "react";
import {
  TextInput,
  Textarea,
  Button,
  Paper,
  Title,
  Text,
  Stack,
  Select,
  Table,
  Group,
  Loader,
  Alert,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import {
  createAssignment,
  fetchAllCourses,
  fetchCourseAssignments,
} from "../../services/onlineCmsService";

export default function CreateAssignment() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignments, setAssignments] = useState([]);

  const courseOptions = useMemo(
    () =>
      (Array.isArray(courses) ? courses : []).map((c) => ({
        value: String(c.id),
        label: `${c.title} (#${c.id})`,
      })),
    [courses],
  );

  useEffect(() => {
    const load = async () => {
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
    load();
  }, []);

  useEffect(() => {
    const loadAssignments = async () => {
      if (!courseId) {
        setAssignments([]);
        return;
      }

      setAssignmentsLoading(true);
      try {
        const data = await fetchCourseAssignments(courseId);
        setAssignments(Array.isArray(data) ? data : []);
      } catch (error) {
        notifications.show({
          title: "Error",
          message:
            error.response?.data?.error || "Failed to load assignments.",
          color: "red",
        });
      } finally {
        setAssignmentsLoading(false);
      }
    };

    loadAssignments();
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseId || !title.trim() || !dueDate) {
      notifications.show({
        title: "Validation Error",
        message: "Course ID, title, and due date are required.",
        color: "orange",
      });
      return;
    }

    setLoading(true);
    try {
      const assignment = await createAssignment({
        course_id: courseId,
        title,
        description,
        due_date: dueDate.toISOString(),
      });
      notifications.show({
        title: "Assignment Created",
        message: `"${assignment.title}" created successfully (ID: ${assignment.id}).`,
        color: "green",
      });
      setTitle("");
      setDescription("");
      setDueDate(null);

      const data = await fetchCourseAssignments(courseId);
      setAssignments(Array.isArray(data) ? data : []);
    } catch (error) {
      const msg =
        error.response?.data?.error || "Failed to create assignment.";
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
        Create Assignment
      </Title>
      <Text size="sm" c="dimmed" mb="lg">
        Create a new assignment for one of your courses. Students will be able
        to submit file links before the due date.
      </Text>
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
            required
          />
          <TextInput
            label="Assignment Title"
            placeholder="e.g. Problem Set 2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Textarea
            label="Description"
            placeholder="Instructions for students..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            autosize
            minRows={2}
          />
          <DateTimePicker
            label="Due Date"
            placeholder="Pick a due date and time"
            value={dueDate}
            onChange={setDueDate}
            required
          />
          <Button type="submit" loading={loading}>
            Create Assignment
          </Button>
        </Stack>
      </form>

      <Title order={5} mt="xl" mb="sm">
        Existing assignments
      </Title>
      {!courseId && <Alert color="blue">Select a course to view assignments.</Alert>}
      {courseId && assignmentsLoading && (
        <Group justify="center" py="md">
          <Loader size="sm" />
        </Group>
      )}
      {courseId && !assignmentsLoading && assignments.length === 0 && (
        <Alert color="yellow">No assignments created for this course yet.</Alert>
      )}
      {courseId && !assignmentsLoading && assignments.length > 0 && (
        <Table mt="sm" striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Assignment</Table.Th>
              <Table.Th>Due</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {assignments.map((a) => (
              <Table.Tr key={a.id}>
                <Table.Td>
                  {a.title} <Text size="xs" c="dimmed">#{a.id}</Text>
                </Table.Td>
                <Table.Td>
                  {a.due_date ? new Date(a.due_date).toLocaleString() : "—"}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Paper>
  );
}
