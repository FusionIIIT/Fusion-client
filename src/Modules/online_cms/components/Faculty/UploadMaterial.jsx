import { useEffect, useMemo, useState } from "react";
import {
  TextInput,
  Button,
  Paper,
  Title,
  Text,
  Stack,
  Select,
  Table,
  Anchor,
  Group,
  Loader,
  Alert,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  fetchAllCourses,
  fetchCourseMaterials,
  uploadMaterial,
} from "../../services/onlineCmsService";

export default function UploadMaterial() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState(null);
  const [title, setTitle] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [materials, setMaterials] = useState([]);

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
    const loadMaterials = async () => {
      if (!courseId) {
        setMaterials([]);
        return;
      }

      setMaterialsLoading(true);
      try {
        const data = await fetchCourseMaterials(courseId);
        setMaterials(Array.isArray(data) ? data : []);
      } catch (error) {
        notifications.show({
          title: "Error",
          message:
            error.response?.data?.error || "Failed to load course materials.",
          color: "red",
        });
      } finally {
        setMaterialsLoading(false);
      }
    };

    loadMaterials();
  }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!courseId || !title.trim() || !fileUrl.trim()) {
      notifications.show({
        title: "Validation Error",
        message: "All fields are required.",
        color: "orange",
      });
      return;
    }

    setLoading(true);
    try {
      await uploadMaterial({
        course_id: courseId,
        title,
        file_url: fileUrl,
      });
      notifications.show({
        title: "Material Uploaded",
        message: `"${title}" uploaded successfully.`,
        color: "green",
      });
      setTitle("");
      setFileUrl("");

      const data = await fetchCourseMaterials(courseId);
      setMaterials(Array.isArray(data) ? data : []);
    } catch (error) {
      const msg =
        error.response?.data?.error || "Failed to upload material.";
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
        Upload Course Material
      </Title>
      <Text size="sm" c="dimmed" mb="lg">
        Upload a link to course material (lecture notes, slides, videos) for a
        course you instruct.
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
            label="Material Title"
            placeholder="e.g. Lecture 3 Slides"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <TextInput
            label="File URL"
            placeholder="https://drive.google.com/..."
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            required
          />
          <Button type="submit" loading={loading}>
            Upload Material
          </Button>
        </Stack>
      </form>

      <Title order={5} mt="xl" mb="sm">
        Existing materials
      </Title>
      {!courseId && (
        <Alert color="blue">Select a course to view materials.</Alert>
      )}
      {courseId && materialsLoading && (
        <Group justify="center" py="md">
          <Loader size="sm" />
        </Group>
      )}
      {courseId && !materialsLoading && materials.length === 0 && (
        <Alert color="yellow">No materials uploaded for this course yet.</Alert>
      )}
      {courseId && !materialsLoading && materials.length > 0 && (
        <Table mt="sm" striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Title</Table.Th>
              <Table.Th>Link</Table.Th>
              <Table.Th>Uploaded</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {materials.map((m) => (
              <Table.Tr key={m.id}>
                <Table.Td>{m.title}</Table.Td>
                <Table.Td>
                  <Anchor href={m.file_url} target="_blank" rel="noreferrer">
                    Open
                  </Anchor>
                </Table.Td>
                <Table.Td>
                  {m.uploaded_at ? new Date(m.uploaded_at).toLocaleString() : "—"}
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}
    </Paper>
  );
}
