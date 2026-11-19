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

// TU and TP (total credits and total points behind the CPI, as on the result
// sheet) read as numbers, with no trailing zeros: 148, 1000.3.
const total = {
  format: (value) =>
    value === null || value === undefined
      ? "-"
      : String(Number(value.toFixed(2))),
};

// The discipline column is always shown. The semester column only appears when
// the report spans more than one semester, i.e. when none was chosen.
export const spiCpiColumns = ({ semester }) => [
  { key: "roll_no", label: "Roll No" },
  { key: "student_name", label: "Name" },
  { key: "discipline", label: "Discipline" },
  ...(semester
    ? []
    : [{ key: "semester", label: "Semester", format: (v) => v ?? "-" }]),
  { key: "spi", label: "SPI", ...pointer },
  { key: "cpi", label: "CPI", ...pointer },
  { key: "tu", label: "TU", ...total },
  { key: "tp", label: "TP", ...total },
];

const PROGRAMME_LABELS = { UG: "UG", PG: "PG", PHD: "PhD" };

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
  const [programme, setProgramme] = useState(null);
  const [batchId, setBatchId] = useState(null);
  const [semester, setSemester] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const disciplines = useMemo(
    () =>
      (filters.discipline_batches || [])
        .filter(
          (b) =>
            String(b.year) === batch &&
            (!programme || b.category === programme),
        )
        .map((b) => ({ value: String(b.id), label: b.label })),
    [filters, batch, programme],
  );

  const programmes = (filters.programme_categories || []).map((c) => ({
    value: c,
    label: PROGRAMME_LABELS[c] || c,
  }));

  // A chosen discipline belongs to one batch and programme, so it is cleared
  // when either changes.
  const pickBatch = (value) => {
    setBatch(value);
    setBatchId(null);
  };

  const pickProgramme = (value) => {
    setProgramme(value);
    setBatchId(null);
  };

  const run = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const params = {
        batch,
        ...(programme ? { programme_type: programme } : {}),
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
      setResult({ ...data, batch, programme, discipline: label, semester });
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
        result.programme && PROGRAMME_LABELS[result.programme],
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
          label={optional("Programme")}
          placeholder="All programmes"
          data={programmes}
          value={programme}
          onChange={pickProgramme}
          clearable
          style={{ flex: 1, minWidth: 140 }}
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
                : "Latest graded term",
              color: "teal",
            },
          ]}
        />
      ) : (
        <Text size="sm" c="dimmed">
          Choose a batch, and a programme, discipline or semester if you want
          one, then fetch. Without a semester, each student&apos;s latest term
          with grades is used, as the last row of their transcript: a summer
          term after their latest semester shows as &quot;Summer 2&quot; and so
          on.
        </Text>
      )}
    </Stack>
  );
}

SpiCpiReport.propTypes = {
  filters: PropTypes.shape({
    batches: PropTypes.arrayOf(PropTypes.number),
    semesters: PropTypes.arrayOf(PropTypes.number),
    programme_categories: PropTypes.arrayOf(PropTypes.string),
    discipline_batches: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        year: PropTypes.number,
        label: PropTypes.string,
        category: PropTypes.string,
      }),
    ),
  }).isRequired,
};
