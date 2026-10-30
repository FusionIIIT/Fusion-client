import { useState } from "react";
import PropTypes from "prop-types";
import { Button, Group, Select, Stack, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconSearch } from "@tabler/icons-react";
import axios from "axios";
import { databaseActiveBacklogsRoute } from "../../../routes/academicRoutes";
import ReportTable from "../ReportTable";

const COLUMNS = [
  { key: "batch", label: "Batch" },
  { key: "roll_no", label: "Roll No" },
  { key: "student_name", label: "Student Name" },
  { key: "branch", label: "Branch" },
  { key: "semester", label: "Semester" },
  { key: "course_code", label: "Course Code" },
  { key: "course_name", label: "Course Name" },
  { key: "grade", label: "Grade" },
  { key: "instructor", label: "Instructor" },
];

const asOptions = (values) =>
  (values || []).map((v) => ({ value: String(v), label: String(v) }));

export default function ActiveBacklogsReport({ filters }) {
  const [batch, setBatch] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const { data } = await axios.get(databaseActiveBacklogsRoute, {
        params: batch ? { batch } : {},
        headers: token ? { Authorization: `Token ${token}` } : {},
      });
      setResult(data);
      if (!data.count) {
        showNotification({
          title: "Nothing found",
          message: "No active backlogs for that batch.",
          color: "yellow",
        });
      }
    } catch (error) {
      showNotification({
        title: "Error",
        message: error.response?.data?.detail || "Could not load the backlogs.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack gap="md">
      <Group align="flex-end" gap="md">
        <Select
          label={
            <>
              Batch{" "}
              <Text component="span" size="xs" c="dimmed" fw={400}>
                (optional)
              </Text>
            </>
          }
          placeholder="All batches"
          data={asOptions(filters.batches)}
          value={batch}
          onChange={setBatch}
          clearable
          style={{ flex: 1, minWidth: 140 }}
        />
        <Button
          leftSection={<IconSearch size={16} />}
          onClick={run}
          loading={loading}
          style={{ flexShrink: 0 }}
        >
          Fetch
        </Button>
      </Group>

      {result ? (
        <ReportTable
          columns={COLUMNS}
          rows={result.rows}
          filename={`active_backlogs_${batch || "all"}`}
          badges={[{ label: `${result.students} students`, color: "grape" }]}
        />
      ) : (
        <Text size="sm" c="dimmed">
          Choose a batch, or leave it empty for all batches, then fetch.
        </Text>
      )}
    </Stack>
  );
}

ActiveBacklogsReport.propTypes = {
  filters: PropTypes.shape({
    batches: PropTypes.arrayOf(PropTypes.number),
  }).isRequired,
};
