import { useState } from "react";
import PropTypes from "prop-types";
import { Button, Group, Select, Stack, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconSearch } from "@tabler/icons-react";
import axios from "axios";
import { databaseSpiCpiRoute } from "../../../routes/academicRoutes";
import ReportTable from "../ReportTable";
import {
  asOptions,
  authHeaders,
  fileName,
  optional,
  useBatchFilters,
} from "./batchFilters";

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
// Status (Present, Alumni, ...) is shown only when someone is not present.
export const spiCpiColumns = ({ semester, rows = [] }) => [
  { key: "roll_no", label: "Roll No" },
  { key: "student_name", label: "Name" },
  { key: "discipline", label: "Discipline" },
  ...(rows.some((row) => row.status && row.status !== "Present")
    ? [{ key: "status", label: "Status" }]
    : []),
  ...(semester
    ? []
    : [{ key: "semester", label: "Semester", format: (v) => v ?? "-" }]),
  { key: "spi", label: "SPI", ...pointer },
  { key: "cpi", label: "CPI", ...pointer },
  { key: "tu", label: "TU", ...total },
  { key: "tp", label: "TP", ...total },
];

// The batch, programme, discipline and semester filters of the SPI and CPI
// report and the fetch behind them, which the toppers report shares.
export function useSpiCpi(filters) {
  const batchFilters = useBatchFilters(filters);
  const [semester, setSemester] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const semesterField = (
    <Select
      label={optional("Semester")}
      placeholder="Latest with grades"
      data={asOptions(filters.semesters)}
      value={semester}
      onChange={setSemester}
      clearable
      style={{ flex: 1, minWidth: 150 }}
    />
  );

  // ``extra`` is kept with the result, for what a report adds to the filters.
  const run = async (extra = {}) => {
    setLoading(true);
    try {
      const { data } = await axios.get(databaseSpiCpiRoute, {
        params: { ...batchFilters.params, ...(semester ? { semester } : {}) },
        headers: authHeaders(),
      });
      // What was fetched, so the columns and file name do not follow later
      // changes to the filters.
      setResult({ ...data, ...batchFilters.chosen, semester, ...extra });
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

  return {
    batch: batchFilters.batch,
    fields: (
      <>
        {batchFilters.fields}
        {semesterField}
      </>
    ),
    run,
    result,
    loading,
  };
}

export const fetchButton = (onClick, loading, disabled) => (
  <Button
    leftSection={<IconSearch size={16} />}
    onClick={onClick}
    loading={loading}
    disabled={disabled}
    style={{ flexShrink: 0 }}
  >
    Fetch
  </Button>
);

export default function SpiCpiReport({ filters }) {
  const { batch, fields, run, result, loading } = useSpiCpi(filters);

  return (
    <Stack gap="md">
      <Group align="flex-end" gap="md">
        {fields}
        {fetchButton(() => run(), loading, !batch)}
      </Group>

      {result ? (
        <ReportTable
          columns={spiCpiColumns(result)}
          rows={result.rows}
          filename={fileName(
            "spi_cpi",
            result,
            result.semester ? `sem${result.semester}` : "latest",
          )}
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

export const filtersShape = PropTypes.shape({
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
});

SpiCpiReport.propTypes = { filters: filtersShape.isRequired };
