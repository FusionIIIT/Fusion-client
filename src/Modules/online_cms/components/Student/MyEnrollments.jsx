import { useEffect, useState } from "react";
import {
  Card,
  Text,
  SimpleGrid,
  Loader,
  Container,
  Alert,
  Badge,
  Group,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { fetchStudentCourses } from "../../services/onlineCmsService";

export default function MyEnrollments() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

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
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <Container py="xl" style={{ textAlign: "center" }}>
        <Loader size="lg" />
      </Container>
    );
  }

  if (courses.length === 0) {
    return (
      <Alert color="yellow" mt="md">
        You are not enrolled in any courses yet. Go to Course Catalog to enroll.
      </Alert>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} mt="md">
      {courses.map((course) => (
        <Card key={course.id} shadow="sm" padding="lg" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text fw={600}>{course.title}</Text>
            <Badge color="green" variant="light">Enrolled</Badge>
          </Group>
          <Text size="sm" c="dimmed" mb="xs">
            {course.description || "No description available."}
          </Text>
          <Text size="xs" c="dimmed">
            Instructor: {course.instructor_username || "—"}
          </Text>
        </Card>
      ))}
    </SimpleGrid>
  );
}
