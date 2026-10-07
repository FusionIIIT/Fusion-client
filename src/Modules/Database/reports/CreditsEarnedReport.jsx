import { useState } from "react";
import PropTypes from "prop-types";
import { Button, Group, Select, Stack, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconSearch } from "@tabler/icons-react";
import axios from "axios";
import { databaseCreditsEarnedRoute } from "../../../routes/academicRoutes";
import ReportTable from "../ReportTable";

const COLUMNS = [
  { key: "roll_no", label: "Roll No" },
  { key: "student_name", label: "Student Name" },
  { key: "regular_credits", label: "Regular Credits" },
  { key: "backlog_improvement_credits", label: "Backlog/Improvement Credits" },
  { key: "swayam_credits", label: "Swayam Credits" },
  { key: "total_credits_earned", label: "Total Credits Earned" },
];

const asOptions = (values) =>
  (values || []).map((v) => ({ value: String(v), label: String(v) }));

export default function CreditsEarnedReport({ filters }) {
  const [batch, setBatch] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const ready = Boolean(batch);

  const run = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const { data } = await axios.get(databaseCreditsEarnedRoute, {
        params: { batch },
        headers: token ? { Authorization: `Token ${token}` } : {},
      });
      setResult(data);
      if (!data.count) {
        showNotification({
          title: "Nothing found",
          message: "No graded students match that batch.",
          color: "yellow",
        });
      }
    } catch (error) {
      showNotification({
        title: "Error",
        message: error.response?.data?.detail || "Could not load the credits.",
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
          label="Batch"
          placeholder="Select batch"
          data={asOptions(filters.batches)}
          value={batch}
          onChange={setBatch}
          style={{ flex: 1, minWidth: 130 }}
        />
        <Button
          leftSection={<IconSearch size={16} />}
          onClick={run}
          loading={loading}
          disabled={!ready}
          style={{ flexShrink: 0 }}
        >
          Fetch
        </Button>
      </Group>

      {result ? (
        <ReportTable
          columns={COLUMNS}
          rows={result.rows}
          filename={`credits_earned_${batch}`}
          badges={[{ label: `${result.credits} credits`, color: "teal" }]}
        />
      ) : (
        <Text size="sm" c="dimmed">
          Choose a batch, then fetch.
        </Text>
      )}
    </Stack>
  );
}

CreditsEarnedReport.propTypes = {
  filters: PropTypes.shape({
    batches: PropTypes.arrayOf(PropTypes.number),
  }).isRequired,
};
