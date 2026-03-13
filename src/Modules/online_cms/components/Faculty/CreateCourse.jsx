import { useState } from "react";
import {
  TextInput,
  Textarea,
  Button,
  Paper,
  Title,
  Text,
  Stack,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createCourse } from "../../services/onlineCmsService";

export default function CreateCourse() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      notifications.show({
        title: "Validation Error",
        message: "Course title is required.",
        color: "orange",
      });
      return;
    }

    setLoading(true);
    try {
      const course = await createCourse({ title, description });
      notifications.show({
        title: "Course Created",
        message: `"${course.title}" created successfully (ID: ${course.id}).`,
        color: "green",
      });
      setTitle("");
      setDescription("");
    } catch (error) {
      const msg =
        error.response?.data?.error || "Failed to create course.";
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
        Create New Course
      </Title>
      <Text size="sm" c="dimmed" mb="lg">
        Fill in the details to create a new course. You will be set as the
        instructor automatically.
      </Text>
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Course Title"
            placeholder="e.g. Introduction to Algorithms"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <Textarea
            label="Description"
            placeholder="Brief description of the course..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            autosize
            minRows={3}
          />
          <Button type="submit" loading={loading}>
            Create Course
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
