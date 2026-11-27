import { useState } from "react";
import { Button, Group, Select, Stack, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconSearch } from "@tabler/icons-react";
import axios from "axios";
import { databaseCategoryWiseStudentCountRoute } from "../../../routes/academicRoutes";
import ReportTable from "../ReportTable";
import {
  authHeaders,
  fileName,
  optional,
  useBatchFilters,
} from "./batchFilters";
import { filtersShape } from "./SpiCpiReport";

const GENDERS = [
  { value: "M", label: "Male" },
  { value: "F", label: "Female" },
  { value: "O", label: "Other" },
];

// Gender is recorded reliably from this batch on (see the batch-wise count).
const GENDER_RELIABLE_FROM = 2025;

// EWS students are counted under EWS only, so General to ST (and Other, when
// any student has a category outside these) add up to the total. PwD is
// across all categories.
export const categoryColumns = (rows) => [
  { key: "discipline", label: "Discipline" },
  { key: "gen", label: "General" },
  { key: "ews", label: "EWS" },
  { key: "obc", label: "OBC" },
  { key: "sc", label: "SC" },
  { key: "st", label: "ST" },
  ...(rows.some((row) => row.other) ? [{ key: "other", label: "Other" }] : []),
  { key: "total", label: "Total" },
  { key: "pwd", label: "PwD" },
];

export default function CategoryCountReport({ filters }) {
  const batchFilters = useBatchFilters(filters);
  const [gender, setGender] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(databaseCategoryWiseStudentCountRoute, {
        params: { ...batchFilters.params, ...(gender ? { gender } : {}) },
        headers: authHeaders(),
      });
      setResult({ ...data, ...batchFilters.chosen, gender });
      if (!data.students) {
        showNotification({
          title: "Nothing found",
          message: "No students for that choice.",
          color: "yellow",
        });
      }
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

  const genderLabel =
    result?.gender && GENDERS.find((g) => g.value === result.gender).label;
  const columns = result ? categoryColumns(result.rows) : [];

  return (
    <Stack gap="md">
      <Group align="flex-end" gap="md">
        {batchFilters.fields}
        <Select
          label={optional("Gender")}
          placeholder="All genders"
          data={GENDERS}
          value={gender}
          onChange={setGender}
          clearable
          style={{ flex: 1, minWidth: 130 }}
        />
        <Button
          leftSection={<IconSearch size={16} />}
          onClick={run}
          loading={loading}
          disabled={!batchFilters.batch}
          style={{ flexShrink: 0 }}
        >
          Fetch
        </Button>
      </Group>

      {result ? (
        <ReportTable
          columns={columns}
          rows={result.rows}
          totals={columns.slice(1).map((column) => column.key)}
          filename={fileName(
            "category_count",
            result,
            genderLabel?.toLowerCase(),
          )}
          badges={[
            {
              label: `${result.students} students${
                genderLabel ? ` (${genderLabel})` : ""
              }`,
              color: "grape",
            },
            ...(result.gender && result.no_gender
              ? [
                  {
                    label: `${result.no_gender} with no gender recorded, not counted`,
                    color: "yellow",
                  },
                ]
              : []),
            ...(result.gender && Number(result.batch) < GENDER_RELIABLE_FROM
              ? [
                  {
                    label: `Gender is recorded reliably from the ${GENDER_RELIABLE_FROM} batch`,
                    color: "yellow",
                  },
                ]
              : []),
          ]}
        />
      ) : (
        <Text size="sm" c="dimmed">
          Choose a batch, and a programme, discipline or gender if you want one,
          then fetch. Each programme and discipline gets a row; EWS students are
          counted under EWS only, so the categories add up to the total, and PwD
          students are counted whatever their category.
        </Text>
      )}
    </Stack>
  );
}

CategoryCountReport.propTypes = { filters: filtersShape.isRequired };
