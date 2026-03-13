import { useEffect, useState } from "react";
import {
  Table,
  Text,
  Button,
  Loader,
  Container,
  Alert,
  Badge,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { fetchAllCourses, enrollInCourse } from "../../services/onlineCmsService";

export default function CourseCatalog() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await fetchAllCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: error.response?.data?.error || "Failed to load courses.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleEnroll = async (courseId) => {
    setEnrollingId(courseId);
    try {
      await enrollInCourse(courseId);
      notifications.show({
        title: "Enrolled",
        message: "You have been successfully enrolled in the course.",
        color: "green",
      });
    } catch (error) {
      const msg = error.response?.data?.error || "Enrollment failed.";
      notifications.show({
        title: "Enrollment Failed",
        message: msg,
        color: "red",
      });
    } finally {
      setEnrollingId(null);
    }
  };

  if (loading) {
    return (
      <Container py="xl" style={{ textAlign: "center" }}>
        <Loader size="lg" />
      </Container>
    );
  }

  if (courses.length === 0) {
    return (
      <Alert color="blue" mt="md">
        No courses available at the moment.
      </Alert>
    );
  }

  const rows = courses.map((course) => (
    <Table.Tr key={course.id}>
      <Table.Td>
        <Text fw={600}>{course.title}</Text>
        <Text size="xs" c="dimmed">#{course.id}</Text>
      </Table.Td>
      <Table.Td>{course.instructor_username || "—"}</Table.Td>
      <Table.Td>{course.description || "No description."}</Table.Td>
      <Table.Td>
        <Badge variant="light" color="blue">Active</Badge>
      </Table.Td>
      <Table.Td>
        <Button
          size="xs"
          variant="filled"
          loading={enrollingId === course.id}
          onClick={() => handleEnroll(course.id)}
        >
          Enroll
        </Button>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <Table striped highlightOnHover mt="md" withTableBorder withColumnBorders>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Course</Table.Th>
          <Table.Th>Instructor</Table.Th>
          <Table.Th>Description</Table.Th>
          <Table.Th>Status</Table.Th>
          <Table.Th>Action</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  );
}
