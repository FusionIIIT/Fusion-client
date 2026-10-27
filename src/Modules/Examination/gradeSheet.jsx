import { useState, useEffect } from "react";
import {
  Alert,
  Card,
  Paper,
  Select,
  Button,
  Stack,
  Group,
  Box,
  SimpleGrid,
  LoadingOverlay,
  Text,
} from "@mantine/core";
import axios from "axios";
import { useSelector } from "react-redux";
import GradeSheetList from "./components/gradeSheetList.jsx";
import { generate_full_gradesheet_form } from "./routes/examinationRoutes.jsx";

export default function GradeSheet() {
  const userRole = useSelector((state) => state.user.role);
  const [formData, setFormData] = useState({ batch: "", specialization: "" });
  const [formOptions, setFormOptions] = useState({
    batches: [],
    specializations: [],
  });
  const [students, setStudents] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFormOptions = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setError("No authentication token found!");
        return;
      }
      try {
        setLoading(true);
        const { data } = await axios.get(generate_full_gradesheet_form, {
          params: { role: userRole },
          headers: { Authorization: `Token ${token}` },
        });
        const batches = (data.batches || []).slice().sort((a, b) => {
          const yearA = parseInt(
            (a.label || "").match(/(\d{4})/g)?.pop() || 0,
            10,
          );
          const yearB = parseInt(
            (b.label || "").match(/(\d{4})/g)?.pop() || 0,
            10,
          );
          return yearB - yearA;
        });
        setFormOptions({
          batches: batches.map((batch) => ({
            value: batch.id.toString(),
            label: batch.label,
          })),
          specializations: (data.specializations || []).map((s) => ({
            value: s,
            label: s,
          })),
        });
      } catch (e) {
        setError(`Error fetching form options: ${e.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchFormOptions();
  }, [userRole]);

  const handleChange = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setStudents(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No authentication token found!");
      return;
    }
    if (!formData.batch) {
      setError("Please select a batch.");
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.post(
        generate_full_gradesheet_form,
        {
          Role: userRole,
          batch: formData.batch,
          specialization: formData.specialization || undefined,
        },
        { headers: { Authorization: `Token ${token}` } },
      );
      setStudents(data.students || []);
    } catch (err) {
      setError(`Error fetching students: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card shadow="sm" p="md" radius="md" withBorder>
      <Stack gap="md" pos="relative">
        <LoadingOverlay visible={loading} />
        {error && (
          <Alert color="red" radius="sm">
            {error}
          </Alert>
        )}
        <Paper shadow="sm" radius="sm" p="md" withBorder>
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Every semester a student has been graded in, one course table per
              semester, paginated by Academic Year — the institute's official
              multi-page grade sheet.
            </Text>
            <form onSubmit={handleSubmit}>
              <SimpleGrid cols={2} spacing="md">
                <Box>
                  <Select
                    label="Batch"
                    placeholder="Select or type to search batch"
                    data={formOptions.batches}
                    value={formData.batch?.toString()}
                    onChange={handleChange("batch")}
                    radius="sm"
                    searchable
                    nothingFoundMessage="No matching batch"
                  />
                </Box>
                <Box>
                  <Select
                    label="Specialization (optional)"
                    placeholder="All specializations"
                    data={formOptions.specializations}
                    value={formData.specialization}
                    onChange={handleChange("specialization")}
                    radius="sm"
                    clearable
                  />
                </Box>
              </SimpleGrid>
              <Group justify="flex-end" mt="md">
                <Button type="submit" size="md" radius="sm">
                  Find Students
                </Button>
              </Group>
            </form>
          </Stack>
        </Paper>
        {students !== null && (
          <Paper shadow="sm" radius="sm" p="md" withBorder>
            <GradeSheetList students={students} />
          </Paper>
        )}
      </Stack>
    </Card>
  );
}
