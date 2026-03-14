/**
 * AdminThesisGrades.jsx
 *
 * Acad-admin view for managing PhD thesis evaluation blocks.
 * Workflow: supervisor submits → admin verifies → admin announces → student sees.
 *
 * Two action groups:
 *   • "Verify" — bulk-verify selected blocks that have a grade (not yet verified)
 *   • "Announce" — bulk-announce selected verified blocks
 */

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Title,
  Text,
  Select,
  Button,
  Table,
  Checkbox,
  Badge,
  Loader,
  Center,
  Group,
  Stack,
  Alert,
  Divider,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  IconAlertCircle,
  IconCheck,
  IconSpeakerphone,
} from "@tabler/icons-react";
import axios from "axios";
import {
  adminThesisGradesListRoute,
  adminVerifyThesisGradesRoute,
  adminAnnounceThesisGradesRoute,
} from "../../routes/academicRoutes";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const gradeColor = (g) => (g === "S" ? "green" : g === "X" ? "red" : "gray");
const gradeLabel = (g) => (g === "S" ? "S — Satisfactory" : g === "X" ? "X — Unsatisfactory" : "—");

function lifecycleBadge(ev) {
  if (ev.announced) return <Badge color="teal">Announced</Badge>;
  if (ev.verified)  return <Badge color="blue">Verified</Badge>;
  if (ev.grade)     return <Badge color="yellow">Submitted</Badge>;
  return                     <Badge color="gray">Ungraded</Badge>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminThesisGrades() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [semFilter, setSemFilter]     = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");   // ungraded|pending|verified|announced
  const [selected, setSelected]       = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError]             = useState(null);

  const authHeaders = () => ({
    Authorization: `Token ${localStorage.getItem("authToken")}`,
  });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchEvaluations = useCallback(async () => {
    setLoading(true);
    setSelected([]);
    setError(null);
    try {
      const params = {};
      if (semFilter)  params.semester = semFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await axios.get(adminThesisGradesListRoute, {
        headers: authHeaders(),
        params,
      });
      setEvaluations(res.data.evaluations || []);
    } catch (e) {
      setError(e.response?.data?.error || e.message || "Failed to load evaluations");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semFilter, statusFilter]);

  useEffect(() => { fetchEvaluations(); }, [fetchEvaluations]);

  // ── Selection helpers ──────────────────────────────────────────────────────
  const toggleAll = () => {
    setSelected(selected.length === evaluations.length ? [] : evaluations.map((e) => e.id));
  };
  const toggleOne = (id) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  // ── Bulk actions ───────────────────────────────────────────────────────────
  const bulkAction = async (url, actionName) => {
    if (selected.length === 0) {
      showNotification({ title: "Nothing selected", color: "yellow" });
      return;
    }
    setActionLoading(true);
    try {
      const res = await axios.post(
        url,
        { ids: selected },
        { headers: authHeaders() },
      );
      const count = res.data.count ?? selected.length;
      showNotification({
        title: `${actionName} complete`,
        message: `${count} block(s) ${actionName.toLowerCase()}d`,
        color: "green",
        icon: <IconCheck size={16} />,
      });
      fetchEvaluations();
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || `Failed to ${actionName.toLowerCase()}`,
        color: "red",
        icon: <IconAlertCircle size={16} />,
      });
    } finally {
      setActionLoading(false);
    }
  };

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
          Thesis Grade Management
        </Title>
        <Text size="sm" c="dimmed" ta="center">
          Verify supervisor-submitted S/X grades and announce them to students.
        </Text>

        <Divider />

        {/* Filters */}
        <Group align="flex-end" wrap="wrap">
          <Select
            label="Semester"
            placeholder="All"
            value={semFilter}
            onChange={(v) => setSemFilter(v || "")}
            data={semOptions}
            clearable
            w={180}
          />
          <Select
            label="Status"
            value={statusFilter}
            onChange={(v) => setStatusFilter(v || "")}
            data={[
              { value: "ungraded",  label: "Ungraded" },
              { value: "pending",   label: "Submitted (pending verify)" },
              { value: "verified",  label: "Verified (pending announce)" },
              { value: "announced", label: "Announced" },
            ]}
            w={240}
          />
          <Button variant="light" onClick={fetchEvaluations}>
            Refresh
          </Button>
        </Group>

        {/* Bulk action buttons */}
        <Group>
          <Button
            size="sm"
            leftSection={<IconCheck size={16} />}
            loading={actionLoading}
            disabled={selected.length === 0 || statusFilter === "verified" || statusFilter === "announced"}
            onClick={() => bulkAction(adminVerifyThesisGradesRoute, "Verify")}
          >
            Verify Selected ({selected.length})
          </Button>
          <Button
            size="sm"
            color="teal"
            leftSection={<IconSpeakerphone size={16} />}
            loading={actionLoading}
            disabled={selected.length === 0 || statusFilter !== "verified"}
            onClick={() => bulkAction(adminAnnounceThesisGradesRoute, "Announce")}
          >
            Announce Selected ({selected.length})
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
                <Table.Th>
                  <Checkbox
                    checked={selected.length === evaluations.length && evaluations.length > 0}
                    indeterminate={selected.length > 0 && selected.length < evaluations.length}
                    onChange={toggleAll}
                  />
                </Table.Th>
                <Table.Th>Student</Table.Th>
                <Table.Th>Semester</Table.Th>
                <Table.Th>Thesis Slot</Table.Th>
                <Table.Th>Credits</Table.Th>
                <Table.Th>Block</Table.Th>
                <Table.Th>Grade</Table.Th>
                <Table.Th>Remarks</Table.Th>
                <Table.Th>Submitted By</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {evaluations.map((ev) => (
                <Table.Tr key={ev.id} bg={selected.includes(ev.id) ? "blue.0" : undefined}>
                  <Table.Td>
                    <Checkbox
                      checked={selected.includes(ev.id)}
                      onChange={() => toggleOne(ev.id)}
                    />
                  </Table.Td>
                  <Table.Td>{ev.registration.student.name}</Table.Td>
                  <Table.Td>Sem {ev.registration.semester_no}</Table.Td>
                  <Table.Td>{ev.registration.thesis_slot}</Table.Td>
                  <Table.Td>{ev.registration.credits} Cr</Table.Td>
                  <Table.Td>
                    {ev.block_number} / {ev.total_blocks}
                  </Table.Td>
                  <Table.Td>
                    {ev.grade ? (
                      <Badge color={gradeColor(ev.grade)}>{gradeLabel(ev.grade)}</Badge>
                    ) : (
                      <Text size="xs" c="dimmed">—</Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs">{ev.remarks || "—"}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs">{ev.submitted_by || "—"}</Text>
                  </Table.Td>
                  <Table.Td>{lifecycleBadge(ev)}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Stack>
    </Card>
  );
}
