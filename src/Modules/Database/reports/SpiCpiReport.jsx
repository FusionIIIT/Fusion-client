import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Button, Group, Select, Stack, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconSearch } from "@tabler/icons-react";
import axios from "axios";
import { databaseSpiCpiRoute } from "../../../routes/academicRoutes";
import ReportTable from "../ReportTable";

// SPI and CPI come as numbers so Excel can sort them; they read as on the
// transcript, to one decimal, and "-" where the student has no grades.
const pointer = {
  format: (value) =>
    value === null || value === undefined ? "-" : value.toFixed(1),
  numFmt: "0.0",
};

// The discipline and semester columns only appear when the report spans more
// than one of them, i.e. when that filter was left empty.
export const spiCpiColumns = ({ discipline, semester }) => [
  { key: "roll_no", label: "Roll No" },
  { key: "student_name", label: "Name" },
  ...(discipline ? [] : [{ key: "discipline", label: "Discipline" }]),
  ...(semester
    ? []
    : [{ key: "semester", label: "Semester", format: (v) => v ?? "-" }]),
  { key: "spi", label: "SPI", ...pointer },
  { key: "cpi", label: "CPI", ...pointer },
];

const asOptions = (values) =>
  (values || []).map((v) => ({ value: String(v), label: String(v) }));

const optional = (text) => (
  <>
    {text}{" "}
    <Text component="span" size="xs" c="dimmed" fw={400}>
      (optional)
    </Text>
  </>
);

export default function SpiCpiReport({ filters }) {
  const [batch, setBatch] = useState(null);
  const [batchId, setBatchId] = useState(null);
  const [semester, setSemester] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const disciplines = useMemo(
    () =>
      (filters.discipline_batches || [])
        .filter((b) => String(b.year) === batch)
        .map((b) => ({ value: String(b.id), label: b.label })),
    [filters, batch],
  );

  const pickBatch = (value) => {
    setBatch(value);
    setBatchId(null);
  };

  const run = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const params = {
        batch,
        ...(batchId ? { batch_id: batchId } : {}),
        ...(semester ? { semester } : {}),
      };
      const { data } = await axios.get(databaseSpiCpiRoute, {
        params,
        headers: token ? { Authorization: `Token ${token}` } : {},
      });
      const label = disciplines.find((d) => d.value === batchId)?.label;
      // What was fetched, so the columns and file name do not follow later
      // changes to the filters.
      setResult({ ...data, batch, discipline: label, semester });
      if (!data.count) {
        showNotification({
          title: "Nothing found",
          message: "No students in that batch.",
          color: "yellow",
        });
      }
    } catch (error) {
      showNotification({
        title: "Error",
        message: error.response?.data?.detail || "Could not load SPI and CPI.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const filename = result
    ? [
        "spi_cpi",
        result.batch,
        result.discipline?.replace(/\W+/g, "_"),
        result.semester ? `sem${result.semester}` : "latest",
      ]
        .filter(Boolean)
        .join("_")
    : "";

  return (
    <Stack gap="md">
      <Group align="flex-end" gap="md">
        <Select
          label="Batch"
          placeholder="Select batch"
          data={asOptions(filters.batches)}
          value={batch}
          onChange={pickBatch}
          style={{ flex: 1, minWidth: 130 }}
        />
        <Select
          label={optional("Discipline")}
          placeholder={batch ? "All disciplines" : "Select a batch first"}
          data={disciplines}
          value={batchId}
          onChange={setBatchId}
          disabled={!batch}
          clearable
          style={{ flex: 1, minWidth: 160 }}
        />
        <Select
          label={optional("Semester")}
          placeholder="Latest with grades"
          data={asOptions(filters.semesters)}
          value={semester}
          onChange={setSemester}
          clearable
          style={{ flex: 1, minWidth: 150 }}
        />
        <Button
          leftSection={<IconSearch size={16} />}
          onClick={run}
          loading={loading}
          disabled={!batch}
          style={{ flexShrink: 0 }}
        >
          Fetch
        </Button>
      </Group>

      {result ? (
        <ReportTable
          columns={spiCpiColumns(result)}
          rows={result.rows}
          filename={filename}
          badges={[
            {
              label: `${result.with_grades} of ${result.students} with grades`,
              color: "grape",
            },
            {
              label: result.semester
                ? `Semester ${result.semester}`
                : "Latest graded semester",
              color: "teal",
            },
          ]}
        />
      ) : (
        <Text size="sm" c="dimmed">
          Choose a batch, and a discipline or semester if you want one, then
          fetch. Without a semester, each student&apos;s latest semester with
          grades is used.
        </Text>
      )}
    </Stack>
  );
}

SpiCpiReport.propTypes = {
  filters: PropTypes.shape({
    batches: PropTypes.arrayOf(PropTypes.number),
    semesters: PropTypes.arrayOf(PropTypes.number),
    discipline_batches: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        year: PropTypes.number,
        label: PropTypes.string,
      }),
    ),
  }).isRequired,
};
