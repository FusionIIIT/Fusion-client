import { useState, useEffect } from "react";

import { Button, Group, Stack, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconSearch } from "@tabler/icons-react";
import axios from "axios";
import { databaseBranchWiseStudentCountRoute } from "../../../routes/academicRoutes";
import ReportTable from "../ReportTable";

const COLUMNS = [
  { key: "batch", label: "Batch" },
  { key: "branch", label: "Branch / Discipline" },
  { key: "male", label: "Male Candidates" },
  { key: "female", label: "Female Candidates" },
  { key: "total", label: "Total Candidates" },
];

export default function BranchWiseStudentCountReport() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const { data } = await axios.get(databaseBranchWiseStudentCountRoute, {
        headers: token ? { Authorization: `Token ${token}` } : {},
      });
      setResult(data);
    } catch (error) {
      showNotification({
        title: "Error",
        message: error.response?.data?.detail || "Could not load the counts.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    run();
  }, []);

  return (
    <Stack gap="md">
      <Group align="flex-end" gap="md">
        <Button
          leftSection={<IconSearch size={16} />}
          onClick={run}
          loading={loading}
          style={{ flexShrink: 0 }}
        >
          Refresh
        </Button>
      </Group>

      {result ? (
        <ReportTable
          columns={COLUMNS}
          rows={result.rows}
          filename="branch_wise_student_count"
        />
      ) : (
        <Text size="sm" c="dimmed">
          Fetching data...
        </Text>
      )}
    </Stack>
  );
}
