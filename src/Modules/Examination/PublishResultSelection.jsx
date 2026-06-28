import React, { useEffect, useMemo, useState, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Card,
  Paper,
  Table,
  Text,
  Group,
  Button,
  Loader,
  Alert,
  Title,
  Checkbox,
  TextInput,
  Badge,
} from "@mantine/core";
import { IconArrowLeft, IconSearch, IconX } from "@tabler/icons-react";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  announcement_students,
  publish_result_selected,
} from "./routes/examinationRoutes.jsx";

// Lightweight, memoised row: a native checkbox is far cheaper than a Mantine
// Checkbox when rendering hundreds of students, and React.memo means toggling
// one student only re-renders that row instead of the whole table.
const StudentRow = React.memo(function StudentRow({
  student,
  checked,
  onToggle,
}) {
  return (
    <tr>
      <td>
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onToggle(student.roll_no)}
          aria-label={`Select ${student.roll_no}`}
          style={{ width: 16, height: 16, cursor: "pointer" }}
        />
      </td>
      <td>{student.s_no}</td>
      <td>{student.roll_no}</td>
      <td>{student.name}</td>
      <td>{student.discipline}</td>
    </tr>
  );
});

StudentRow.propTypes = {
  student: PropTypes.shape({
    s_no: PropTypes.number,
    roll_no: PropTypes.string,
    name: PropTypes.string,
    discipline: PropTypes.string,
  }).isRequired,
  checked: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default function PublishResultSelection() {
  const userRole = useSelector((state) => state.user.role);
  const navigate = useNavigate();
  const { id } = useParams();

  const [meta, setMeta] = useState(null);
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    axios
      .get(announcement_students, {
        params: { id, role: userRole },
        headers: { Authorization: `Token ${token}` },
      })
      .then(({ data }) => {
        const rows = Array.isArray(data.students) ? data.students : [];
        setMeta({
          batch_label: data.batch_label,
          semester_label: data.semester_label,
          announced: data.announced,
        });
        setStudents(rows);
        // Default selection = students currently marked published (all on first publish).
        setSelected(
          new Set(rows.filter((s) => s.published).map((s) => s.roll_no)),
        );
      })
      .catch((err) => {
        const code = err?.response?.status;
        setFetchError(
          code === 403
            ? "You do not have permission to publish results."
            : code === 404
              ? "Announcement not found."
              : "Could not load students. Please try again.",
        );
      })
      .finally(() => setLoading(false));
  }, [id, userRole]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.roll_no.toLowerCase().includes(q) ||
        (s.name || "").toLowerCase().includes(q),
    );
  }, [students, search]);

  const allVisibleChecked =
    filtered.length > 0 && filtered.every((s) => selected.has(s.roll_no));
  const someVisibleChecked = filtered.some((s) => selected.has(s.roll_no));

  const toggleOne = useCallback((roll) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(roll)) next.delete(roll);
      else next.add(roll);
      return next;
    });
  }, []);

  const toggleAllVisible = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleChecked) {
        filtered.forEach((s) => next.delete(s.roll_no));
      } else {
        filtered.forEach((s) => next.add(s.roll_no));
      }
      return next;
    });
  };

  const handlePublish = async () => {
    // Publishing with nobody selected hides the result from the whole batch
    // (acts as a full revert) — confirm before doing that.
    if (
      selected.size === 0 &&
      // eslint-disable-next-line no-alert
      !window.confirm(
        "No students are selected. This will hide the result from the entire batch. Continue?",
      )
    ) {
      return;
    }
    setSubmitting(true);
    const token = localStorage.getItem("authToken");
    try {
      const { data } = await axios.post(
        publish_result_selected,
        { id, roll_numbers: Array.from(selected), Role: userRole },
        { headers: { Authorization: `Token ${token}` } },
      );
      showNotification({
        title: "Result Published",
        message: `Published to ${data.published_count} of ${data.total} students.`,
        color: "green",
      });
      navigate("/examination/result-announcement");
    } catch (err) {
      const code = err?.response?.status;
      showNotification({
        title: "Could Not Publish",
        message:
          code === 403
            ? "You do not have permission to publish results."
            : "Something went wrong. Please try again.",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <Card p="lg" radius="md" withBorder>
        <Group position="center">
          <Loader size="lg" />
          <Text>Loading students...</Text>
        </Group>
      </Card>
    );

  if (fetchError)
    return (
      <Card p="lg" radius="md" withBorder>
        <Alert icon={<IconX size={16} />} title="Failed to Load" color="red">
          {fetchError}
        </Alert>
        <Button
          mt="md"
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate("/examination/result-announcement")}
        >
          Back to Announcements
        </Button>
      </Card>
    );

  return (
    <Card p="lg" radius="md" withBorder>
      <Group position="apart" mb="xs">
        <Button
          variant="subtle"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate("/examination/result-announcement")}
        >
          Back
        </Button>
        <Button onClick={handlePublish} loading={submitting}>
          Publish ({selected.size})
        </Button>
      </Group>

      <Title order={2} mb={4}>
        Publish Result
      </Title>
      {meta && (
        <Group spacing="xs" mb="md">
          <Badge variant="outline">{meta.batch_label}</Badge>
          <Badge variant="outline">{meta.semester_label}</Badge>
        </Group>
      )}

      <Text size="sm" c="dimmed" mb="md">
        Only checked students will see their result. Uncheck a student and
        publish to hide (revert) their result; uncheck everyone and publish to
        revert the whole batch.
      </Text>

      <Paper shadow="sm" p="md" withBorder>
        <TextInput
          placeholder="Search by roll number or name..."
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          icon={<IconSearch size={16} />}
          mb="md"
        />
        <Table highlightOnHover striped>
          <thead>
            <tr>
              <th style={{ width: 48 }}>
                <Checkbox
                  checked={allVisibleChecked}
                  indeterminate={someVisibleChecked && !allVisibleChecked}
                  onChange={toggleAllVisible}
                  aria-label="Select all"
                />
              </th>
              <th style={{ width: 70 }}>S. No.</th>
              <th>Roll No.</th>
              <th>Name</th>
              <th>Discipline</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <StudentRow
                key={s.roll_no}
                student={s}
                checked={selected.has(s.roll_no)}
                onToggle={toggleOne}
              />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5}>
                  <Text ta="center" c="dimmed" py="md">
                    No students found.
                  </Text>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Paper>
    </Card>
  );
}
