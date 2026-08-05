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

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Tooltip,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import {
  IconAlertCircle,
  IconCheck,
  IconSpeakerphone,
} from "@tabler/icons-react";
import axios from "axios";
import PropTypes from "prop-types";
import {
  adminThesisGradesListRoute,
  adminVerifyThesisGradesRoute,
  adminAnnounceThesisGradesRoute,
} from "../../routes/academicRoutes";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const gradeColor = (g) => (g === "S" ? "green" : g === "X" ? "red" : "gray");
const gradeLabel = (g) =>
  g === "S" ? "S — Satisfactory" : g === "X" ? "X — Unsatisfactory" : "—";

function ThesisTitleCell({ title }) {
  if (!title) {
    return (
      <Text size="xs" c="dimmed">
        —
      </Text>
    );
  }
  if (title.length <= 50) {
    return <Text size="xs">{title}</Text>;
  }
  return (
    <Tooltip label={title} multiline w={300} withArrow>
      <Text size="xs" style={{ cursor: "help" }}>
        {title.slice(0, 50)}…
      </Text>
    </Tooltip>
  );
}

ThesisTitleCell.propTypes = {
  title: PropTypes.string,
};

ThesisTitleCell.defaultProps = {
  title: "",
};

// One evaluation within a registration row: a checkbox (for the bulk verify/
// announce action) plus its grade badge, rendered inline alongside its
// siblings inside one shared "Grades" cell — not its own column. Remarks/
// submitted-by are shown on hover instead of dedicated columns, since
// they're read-only here. No lifecycle badge here — the Status filter always
// narrows to one specific status (there's no "All" option), so every visible
// entry already matches it and repeating that status on every cell would
// just be noise.
function AdminBlockCell({ ev, isSelected, onToggle }) {
  return (
    <Group gap={6} wrap="nowrap">
      <Checkbox
        size="xs"
        checked={isSelected}
        onChange={() => onToggle(ev.id)}
      />
      <Tooltip
        label={`Submitted by ${ev.submitted_by || "—"}${ev.remarks ? ` — ${ev.remarks}` : ""}`}
        withArrow
        multiline
        w={220}
      >
        <Badge size="xs" color={gradeColor(ev.grade)}>
          {gradeLabel(ev.grade)}
        </Badge>
      </Tooltip>
    </Group>
  );
}

AdminBlockCell.propTypes = {
  ev: PropTypes.shape({
    id: PropTypes.number.isRequired,
    submitted_by: PropTypes.string,
    remarks: PropTypes.string,
    grade: PropTypes.string,
  }).isRequired,
  isSelected: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminThesisGrades() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [semFilter, setSemFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending"); // ungraded|pending|verified|announced
  const [selected, setSelected] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

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
      if (semFilter) params.semester = semFilter;
      if (statusFilter) params.status = statusFilter;
      const res = await axios.get(adminThesisGradesListRoute, {
        headers: authHeaders(),
        params,
      });
      setEvaluations(res.data.evaluations || []);
    } catch (e) {
      setError(
        e.response?.data?.error || e.message || "Failed to load evaluations",
      );
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [semFilter, statusFilter]);

  useEffect(() => {
    fetchEvaluations();
  }, [fetchEvaluations]);

  // ── Selection helpers ──────────────────────────────────────────────────────
  const toggleAll = () => {
    setSelected(
      selected.length === evaluations.length
        ? []
        : evaluations.map((e) => e.id),
    );
  };
  const toggleOne = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  // Toggle every block belonging to one registration row at once.
  const toggleRow = (rowBlockIds) => {
    const allSelected = rowBlockIds.every((id) => selected.includes(id));
    setSelected((prev) =>
      allSelected
        ? prev.filter((id) => !rowBlockIds.includes(id))
        : [...new Set([...prev, ...rowBlockIds])],
    );
  };

  // Group the flat block list into one entry per thesis registration, so the
  // table shows one row per student instead of one row per block.
  const groupedRegistrations = useMemo(() => {
    const map = new Map();
    evaluations.forEach((ev) => {
      const key = ev.registration.id;
      if (!map.has(key)) map.set(key, {});
      map.get(key)[ev.block_number] = ev;
    });
    return Array.from(map.entries());
  }, [evaluations]);

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
        message: `${count} grade(s) ${actionName.toLowerCase()}d`,
        color: "green",
        icon: <IconCheck size={16} />,
      });
      fetchEvaluations();
    } catch (e) {
      showNotification({
        title: "Error",
        message:
          e.response?.data?.error || `Failed to ${actionName.toLowerCase()}`,
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
    <Card shadow="sm" p="lg" radius="md" withBorder mb="xl">
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
              { value: "ungraded", label: "Ungraded" },
              { value: "pending", label: "Submitted (pending verify)" },
              { value: "verified", label: "Verified (pending announce)" },
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
            disabled={
              selected.length === 0 ||
              statusFilter === "verified" ||
              statusFilter === "announced"
            }
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
            onClick={() =>
              bulkAction(adminAnnounceThesisGradesRoute, "Announce")
            }
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
            No grade entries found for the selected filters.
          </Text>
        ) : (
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  <Checkbox
                    checked={
                      selected.length === evaluations.length &&
                      evaluations.length > 0
                    }
                    indeterminate={
                      selected.length > 0 &&
                      selected.length < evaluations.length
                    }
                    onChange={toggleAll}
                  />
                </Table.Th>
                <Table.Th>Roll No</Table.Th>
                <Table.Th>Student</Table.Th>
                <Table.Th>Semester</Table.Th>
                <Table.Th>Thesis Code</Table.Th>
                <Table.Th>Thesis Title</Table.Th>
                <Table.Th>Credits</Table.Th>
                <Table.Th>Grades</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {groupedRegistrations.map(([registrationId, blocksByNumber]) => {
                const blocks = Object.values(blocksByNumber).sort(
                  (a, b) => a.block_number - b.block_number,
                );
                const reg = blocks[0].registration;
                const rowBlockIds = blocks.map((ev) => ev.id);
                const allSelected = rowBlockIds.every((id) =>
                  selected.includes(id),
                );
                const someSelected = rowBlockIds.some((id) =>
                  selected.includes(id),
                );

                return (
                  <Table.Tr key={registrationId}>
                    <Table.Td>
                      <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected && !allSelected}
                        onChange={() => toggleRow(rowBlockIds)}
                      />
                    </Table.Td>
                    <Table.Td>{reg.student.id}</Table.Td>
                    <Table.Td>{reg.student.name}</Table.Td>
                    <Table.Td>{reg.semester_no}</Table.Td>
                    <Table.Td>{reg.thesis_code}</Table.Td>
                    <Table.Td>
                      <ThesisTitleCell title={reg.thesis_title} />
                    </Table.Td>
                    <Table.Td>{reg.credits} Cr</Table.Td>
                    <Table.Td>
                      <Group gap="sm" wrap="wrap">
                        {blocks.map((ev) => (
                          <AdminBlockCell
                            key={ev.block_number}
                            ev={ev}
                            isSelected={selected.includes(ev.id)}
                            onToggle={toggleOne}
                          />
                        ))}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        )}
      </Stack>
    </Card>
  );
}
