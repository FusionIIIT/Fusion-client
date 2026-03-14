/**
 * SupervisorThesisGrading.jsx
 *
 * Faculty supervisor view for submitting S/X grades on student thesis
 * evaluation blocks.  Each verified ThesisRegistration has N blocks where
 * N = credits ÷ 3.  Supervisors submit one grade (S or X) per block;
 * the grade can be updated until the admin verifies it.
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Title,
  Text,
  Select,
  Button,
  Table,
  Badge,
  Loader,
  Center,
  Group,
  Stack,
  SegmentedControl,
  Textarea,
  Alert,
  Divider,
  Tooltip,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  IconAlertCircle,
  IconCheck,
  IconChalkboard,
} from "@tabler/icons-react";
import axios from "axios";
import {
  supervisorThesisGradesRoute,
  supervisorSubmitThesisGradeRoute,
} from "../../routes/academicRoutes";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const gradeColor = (g) => (g === "S" ? "green" : g === "X" ? "red" : "gray");
const gradeLabel = (g) => (g === "S" ? "Satisfactory" : g === "X" ? "Unsatisfactory" : "—");

function statusBadge(ev) {
  if (ev.announced) return <Badge color="teal">Announced</Badge>;
  if (ev.verified)  return <Badge color="blue">Verified</Badge>;
  if (ev.grade)     return <Badge color="yellow">Submitted</Badge>;
  return                     <Badge color="gray">Pending</Badge>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-component: single evaluation row
// ─────────────────────────────────────────────────────────────────────────────
function EvalRow({ ev, onGraded }) {
  const [chosenGrade, setChosenGrade] = useState(ev.grade || "S");
  const [remarks, setRemarks]         = useState(ev.remarks || "");
  const [saving, setSaving]           = useState(false);
  const locked = ev.verified || ev.announced;

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.post(
        supervisorSubmitThesisGradeRoute,
        { evaluation_id: ev.id, grade: chosenGrade, remarks },
        { headers: { Authorization: `Token ${token}` } },
      );
      showNotification({
        title: "Grade saved",
        message: `Block ${ev.block_number} → ${gradeLabel(chosenGrade)}`,
        color: "green",
        icon: <IconCheck size={16} />,
      });
      onGraded(res.data);
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Failed to save grade",
        color: "red",
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Table.Tr>
      <Table.Td>{ev.registration.student.name}</Table.Td>
      <Table.Td>Sem {ev.registration.semester_no}</Table.Td>
      <Table.Td>{ev.registration.thesis_slot}</Table.Td>
      <Table.Td>
        Block&nbsp;{ev.block_number}&nbsp;/&nbsp;{ev.total_blocks}
      </Table.Td>
      <Table.Td>
        {locked ? (
          <Badge color={gradeColor(ev.grade)}>{gradeLabel(ev.grade)}</Badge>
        ) : (
          <SegmentedControl
            size="xs"
            value={chosenGrade}
            onChange={setChosenGrade}
            data={[
              { label: "S — Satisfactory",   value: "S" },
              { label: "X — Unsatisfactory", value: "X" },
            ]}
            color={chosenGrade === "S" ? "green" : "red"}
          />
        )}
      </Table.Td>
      <Table.Td>
        {locked ? (
          <Text size="xs" c="dimmed">{ev.remarks || "—"}</Text>
        ) : (
          <Textarea
            size="xs"
            placeholder="Optional remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.currentTarget.value)}
            rows={1}
            autosize
            maxRows={3}
          />
        )}
      </Table.Td>
      <Table.Td>{statusBadge(ev)}</Table.Td>
      <Table.Td>
        {locked ? (
          <Tooltip label="Grade locked by admin" withArrow>
            <Button size="xs" variant="light" disabled>
              Locked
            </Button>
          </Tooltip>
        ) : (
          <Button
            size="xs"
            loading={saving}
            onClick={handleSubmit}
            color={chosenGrade === "S" ? "green" : "red"}
          >
            {ev.grade ? "Update" : "Submit"}
          </Button>
        )}
      </Table.Td>
    </Table.Tr>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export default function SupervisorThesisGrading() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [semFilter, setSemFilter]     = useState("");
  const [gradedFilter, setGradedFilter] = useState("");   // "" | "false" | "true"

  const authHeaders = () => ({
    Authorization: `Token ${localStorage.getItem("authToken")}`,
  });

  const fetchEvaluations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (semFilter)    params.semester = semFilter;
      if (gradedFilter) params.graded   = gradedFilter;
      const res = await axios.get(supervisorThesisGradesRoute, {
        headers: authHeaders(),
        params,
      });
      setEvaluations(res.data.evaluations || []);
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Failed to load grades");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semFilter, gradedFilter]);

  useEffect(() => { fetchEvaluations(); }, [fetchEvaluations]);

  // Update one evaluation in the list after supervisor submits
  const handleGraded = useCallback((updated) => {
    setEvaluations((prev) =>
      prev.map((ev) => (ev.id === updated.id ? updated : ev)),
    );
  }, []);

  // Build unique semester options from loaded data
  const semOptions = [
    { value: "", label: "All Semesters" },
    ...Array.from(
      new Set(evaluations.map((ev) => String(ev.registration.semester_no))),
    )
      .sort((a, b) => Number(a) - Number(b))
      .map((s) => ({ value: s, label: `Semester ${s}` })),
  ];

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Stack gap="md">
        {/* Header */}
        <Title order={3} c="blue" fw={700} ta="center">
          Thesis Grade Submission
        </Title>
        <Text size="sm" c="dimmed" ta="center">
          Submit S (Satisfactory) or X (Unsatisfactory) grades for each
          evaluation block of your supervised PhD students.
        </Text>

        <Divider />

        {/* Filters */}
        <Group>
          <Select
            label="Filter by Semester"
            placeholder="All Semesters"
            value={semFilter}
            onChange={(v) => setSemFilter(v || "")}
            data={semOptions}
            clearable
            w={200}
          />
          <Select
            label="Filter by Status"
            placeholder="All"
            value={gradedFilter}
            onChange={(v) => setGradedFilter(v || "")}
            data={[
              { value: "",      label: "All" },
              { value: "false", label: "Pending (not yet graded)" },
              { value: "true",  label: "Graded" },
            ]}
            w={220}
          />
          <Button
            variant="light"
            mt="xl"
            onClick={fetchEvaluations}
            leftSection={<IconChalkboard size={16} />}
          >
            Refresh
          </Button>
        </Group>

        {/* Body */}
        {loading ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : error ? (
          <Alert color="red" icon={<IconAlertCircle size={16} />}>
            {error}
          </Alert>
        ) : evaluations.length === 0 ? (
          <Text ta="center" c="dimmed" py="xl">
            No evaluation blocks found for the selected filters.
          </Text>
        ) : (
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Student</Table.Th>
                <Table.Th>Semester</Table.Th>
                <Table.Th>Thesis Slot</Table.Th>
                <Table.Th>Block</Table.Th>
                <Table.Th>Grade</Table.Th>
                <Table.Th>Remarks</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {evaluations.map((ev) => (
                <EvalRow key={ev.id} ev={ev} onGraded={handleGraded} />
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Stack>
    </Card>
  );
}
