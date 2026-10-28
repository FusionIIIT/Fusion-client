import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Button, Group, MultiSelect, Select, Stack, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconDeviceFloppy, IconSearch } from "@tabler/icons-react";
import axios from "axios";
import {
  databaseCoreCourseGradesRoute,
  databaseReportCoursesRoute,
} from "../../../routes/academicRoutes";
import ReportTable from "../ReportTable";

// The course columns are whatever courses are picked, in the order picked.
const BASE_COLUMNS = [
  { key: "roll_no", label: "Roll No" },
  { key: "student_name", label: "Student Name" },
  { key: "branch", label: "Branch" },
  { key: "regular_credits", label: "Regular Credits" },
  { key: "backlog_improvement_credits", label: "Backlog/Improvement Credits" },
  { key: "swayam_credits", label: "Swayam Credits" },
  { key: "total_credits_earned", label: "Total Credits Earned" },
];

// Also drives the remaining-core report, which differs only in its endpoint.
export default function CoreCourseGradesReport({
  filters,
  route = databaseCoreCourseGradesRoute,
  filePrefix = "common_course_grades",
}) {
  const [year, setYear] = useState(null);
  const [batchId, setBatchId] = useState(null);
  // Saving keeps the course list on this browser, one list per report, so it
  // is there on the next visit and for every batch.
  const storageKey = `database:${filePrefix}:courses`;
  const [saved, setSaved] = useState(() => {
    try {
      const list = JSON.parse(localStorage.getItem(storageKey));
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  });
  const [picked, setPicked] = useState(saved);
  const unsaved = picked.join(",") !== saved.join(",");
  const [allCourses, setAllCourses] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const batchParams = batchId ? { batch_id: batchId } : { batch: year };
  const authHeaders = () => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Token ${token}` } : {};
  };

  useEffect(() => {
    axios
      .get(databaseReportCoursesRoute, { headers: authHeaders() })
      .then(({ data }) => setAllCourses(data.courses))
      .catch(() =>
        showNotification({
          title: "Error",
          message: "Could not load the course list.",
          color: "red",
        }),
      );
  }, []);

  const saveCourses = () => {
    localStorage.setItem(storageKey, JSON.stringify(picked));
    setSaved(picked);
    showNotification({
      title: "Saved",
      message: picked.length
        ? `${picked.length} course${picked.length === 1 ? "" : "s"} saved for next time.`
        : "The saved course list is cleared.",
      color: "green",
    });
  };

  // A saved course whose record has since gone still shows, by its code, so
  // it can be seen and removed.
  const courseOptions = useMemo(() => {
    const options = allCourses.map((course) => ({
      value: course.code.toUpperCase(),
      label: `${course.code} - ${course.name}`,
    }));
    const known = new Set(options.map((option) => option.value));
    picked
      .filter((code) => !known.has(code))
      .forEach((code) => options.push({ value: code, label: code }));
    return options;
  }, [allCourses, picked]);

  const ugBatches = useMemo(() => filters.ug_batches || [], [filters]);
  const years = useMemo(
    () =>
      [...new Set(ugBatches.map((b) => b.year))].map((y) => ({
        value: String(y),
        label: String(y),
      })),
    [ugBatches],
  );
  const disciplines = useMemo(
    () =>
      ugBatches
        .filter((b) => String(b.year) === year)
        .map((b) => ({ value: String(b.id), label: b.label })),
    [ugBatches, year],
  );

  const pickYear = (value) => {
    setYear(value);
    setBatchId(null);
  };

  const run = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(route, {
        params: { ...batchParams, courses: picked.join(",") },
        headers: authHeaders(),
      });
      setResult(data);
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
        message: error.response?.data?.detail || "Could not load the grades.",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const columns = result
    ? [
        ...BASE_COLUMNS,
        ...result.courses.map((course) => ({
          key: course.key,
          label: course.code,
        })),
      ]
    : BASE_COLUMNS;

  return (
    <Stack gap="md">
      <Group align="flex-end" gap="md">
        <Select
          label="Batch"
          placeholder="Select batch"
          data={years}
          value={year}
          onChange={pickYear}
          style={{ flex: 1, minWidth: 130 }}
        />
        <Select
          label={
            <>
              Discipline{" "}
              <Text component="span" size="xs" c="dimmed" fw={400}>
                (optional)
              </Text>
            </>
          }
          placeholder={year ? "All disciplines" : "Select a batch first"}
          data={disciplines}
          value={batchId}
          onChange={setBatchId}
          disabled={!year}
          clearable
          style={{ flex: 1, minWidth: 160 }}
        />
      </Group>

      <MultiSelect
        label="Courses"
        description="Only the courses added here get a grade column, in this order. Save the list to have it here next time."
        placeholder={
          year ? "Search and select courses" : "Select a batch first"
        }
        data={courseOptions}
        value={picked}
        onChange={setPicked}
        disabled={!year}
        searchable
        clearable
        hidePickedOptions
        maxDropdownHeight={280}
        nothingFoundMessage="No such course"
      />

      <Group>
        <Button
          leftSection={<IconSearch size={16} />}
          onClick={run}
          loading={loading}
          disabled={!year || !picked.length}
        >
          Fetch
        </Button>
        <Button
          variant="default"
          leftSection={<IconDeviceFloppy size={16} />}
          onClick={saveCourses}
          disabled={!unsaved}
        >
          Save courses
        </Button>
        {unsaved && (
          <Text size="xs" c="dimmed">
            Unsaved changes to the course list
          </Text>
        )}
      </Group>

      {result ? (
        <ReportTable
          columns={columns}
          rows={result.rows}
          filename={`${filePrefix}_${result.batch.replace(/[\s.]+/g, "_")}`}
          badges={[
            { label: result.batch, color: "grape" },
            { label: `${result.courses.length} courses`, color: "teal" },
          ]}
        />
      ) : (
        <Text size="sm" c="dimmed">
          Choose a batch, and a discipline or leave it for all, add the courses,
          then fetch.
        </Text>
      )}
    </Stack>
  );
}

CoreCourseGradesReport.propTypes = {
  filters: PropTypes.shape({
    ug_batches: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        year: PropTypes.number,
        label: PropTypes.string,
      }),
    ),
  }).isRequired,
  route: PropTypes.string,
  filePrefix: PropTypes.string,
};
