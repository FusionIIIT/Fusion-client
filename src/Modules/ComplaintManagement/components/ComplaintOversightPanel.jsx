import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Group,
  Paper,
  Select,
  ScrollArea,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ArrowClockwise, ArrowSquareOut } from "@phosphor-icons/react";
import ComplaintBulkActionModal from "./ComplaintBulkActionModal";
import { bulkComplaintAction, fetchWorkers } from "../services";
import classes from "../ComplaintManagement.module.css";

const STATUS_LABELS = new Map([
  [0, "Pending"],
  [1, "In Progress"],
  [2, "Resolved"],
  [3, "Closed"],
  [4, "Escalated"],
  [5, "Reopened"],
]);

const FILTER_OPTIONS = [
  { value: "all", label: "All Critical" },
  { value: "overdue", label: "Overdue" },
  { value: "escalated", label: "Escalated" },
  { value: "stalled", label: "Stalled" },
  { value: "unassigned", label: "Unassigned" },
];

const getMessage = (error, fallback) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.response?.data) {
    return JSON.stringify(error.response.data);
  }
  return error?.message || fallback;
};

const isOverdue = (complaint) => {
  if (!complaint?.sla_deadline) {
    return false;
  }
  const deadline = new Date(complaint.sla_deadline).getTime();
  return (
    Number.isFinite(deadline) &&
    deadline < Date.now() &&
    ![3, 2].includes(Number(complaint.status))
  );
};

const isEscalated = (complaint) =>
  Number(complaint.is_escalated) === 1 || Number(complaint.status) === 4;

const isStalled = (complaint) => {
  const timestamp = complaint.updated_at || complaint.complaint_date;
  if (!timestamp) {
    return false;
  }
  const hoursSinceUpdate =
    (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60);
  return hoursSinceUpdate >= 72 && ![2, 3].includes(Number(complaint.status));
};

const isUnassigned = (complaint) =>
  !complaint.assigned_to && !complaint.assigned_to_name && !complaint.worker_id;

export default function ComplaintOversightPanel({
  complaints,
  onView,
  onRefresh,
}) {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [modalMode, setModalMode] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const loadWorkers = async () => {
      setLoadingWorkers(true);
      try {
        const list = await fetchWorkers();
        setWorkers(list);
      } catch (error) {
        notifications.show({
          color: "red",
          title: "Failed to load workers",
          message: getMessage(
            error,
            "Could not fetch workers for reassignment.",
          ),
        });
      } finally {
        setLoadingWorkers(false);
      }
    };

    loadWorkers();
  }, []);

  const derived = useMemo(() => {
    const next = complaints.map((complaint) => ({
      complaint,
      overdue: isOverdue(complaint),
      escalated: isEscalated(complaint),
      stalled: isStalled(complaint),
      unassigned: isUnassigned(complaint),
    }));

    return {
      all: next,
      overdue: next.filter((item) => item.overdue),
      escalated: next.filter((item) => item.escalated),
      stalled: next.filter((item) => item.stalled),
      unassigned: next.filter((item) => item.unassigned),
    };
  }, [complaints]);

  const visibleComplaints = useMemo(() => {
    if (selectedFilter === "all") {
      return derived.overdue
        .concat(derived.escalated, derived.stalled)
        .filter(
          (item, index, array) =>
            array.findIndex(
              (entry) => entry.complaint.id === item.complaint.id,
            ) === index,
        );
    }
    return derived[selectedFilter] || [];
  }, [derived, selectedFilter]);

  useEffect(() => {
    setSelectedIds((current) =>
      current.filter((id) =>
        visibleComplaints.some(
          (item) => String(item.complaint.id) === String(id),
        ),
      ),
    );
  }, [visibleComplaints]);

  const metrics = useMemo(
    () => ({
      overdue: derived.overdue.length,
      escalated: derived.escalated.length,
      stalled: derived.stalled.length,
      unassigned: derived.unassigned.length,
    }),
    [derived],
  );

  const selectedComplaints = visibleComplaints.filter((item) =>
    selectedIds.includes(String(item.complaint.id)),
  );

  const openModal = (mode) => {
    if (selectedIds.length === 0) {
      notifications.show({
        color: "yellow",
        title: "Nothing selected",
        message: "Select one or more complaints first.",
      });
      return;
    }

    setModalMode(mode);
    setModalOpen(true);
  };

  const handleSubmit = async (payload) => {
    setLoadingAction(true);
    try {
      await bulkComplaintAction({
        action: modalMode,
        complaint_ids: selectedComplaints.map((item) => item.complaint.id),
        ...payload,
      });
      notifications.show({
        color: "green",
        title: "Bulk action complete",
        message: `${selectedComplaints.length} complaint${selectedComplaints.length === 1 ? "" : "s"} updated successfully.`,
      });
      setSelectedIds([]);
      setModalOpen(false);
      setModalMode(null);
      await onRefresh();
    } catch (error) {
      notifications.show({
        color: "red",
        title: "Bulk action failed",
        message: getMessage(error, "Could not complete the bulk action."),
      });
    } finally {
      setLoadingAction(false);
    }
  };

  const allVisibleSelected =
    visibleComplaints.length > 0 &&
    visibleComplaints.every((item) =>
      selectedIds.includes(String(item.complaint.id)),
    );

  const toggleVisibleSelection = (checked) => {
    if (checked) {
      setSelectedIds(
        visibleComplaints.map((item) => String(item.complaint.id)),
      );
      return;
    }
    setSelectedIds([]);
  };

  const toggleRowSelection = (complaintId, checked) => {
    const normalizedId = String(complaintId);
    setSelectedIds((current) =>
      checked
        ? Array.from(new Set([...current, normalizedId]))
        : current.filter((id) => id !== normalizedId),
    );
  };

  return (
    <Stack gap="md">
      <Paper className={classes.oversightHeader} withBorder>
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <div>
            <Text fw={600} size="lg">
              Oversight Dashboard
            </Text>
            <Text size="sm" className={classes.subtitle}>
              Track overdue, escalated, stalled, and unassigned complaints.
            </Text>
          </div>
          <Group gap="xs">
            <Button
              variant="default"
              size="sm"
              leftSection={<ArrowClockwise size={14} />}
              onClick={onRefresh}
            >
              Refresh
            </Button>
            <Button
              variant="light"
              size="sm"
              onClick={() => toggleVisibleSelection(!allVisibleSelected)}
            >
              {allVisibleSelected ? "Clear visible" : "Select visible"}
            </Button>
            <Button
              size="sm"
              onClick={() => openModal("reassign")}
              disabled={selectedIds.length === 0 || loadingWorkers}
            >
              Bulk Reassign
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openModal("intervene")}
              disabled={selectedIds.length === 0}
            >
              Bulk Intervene
            </Button>
          </Group>
        </Group>
      </Paper>

      <Group grow align="stretch">
        <Card withBorder className={classes.summaryCard}>
          <Text size="xs" c="dimmed">
            Overdue
          </Text>
          <Text fw={700} size="xl" c="red">
            {metrics.overdue}
          </Text>
        </Card>
        <Card withBorder className={classes.summaryCard}>
          <Text size="xs" c="dimmed">
            Escalated
          </Text>
          <Text fw={700} size="xl" c="orange">
            {metrics.escalated}
          </Text>
        </Card>
        <Card withBorder className={classes.summaryCard}>
          <Text size="xs" c="dimmed">
            Stalled
          </Text>
          <Text fw={700} size="xl" c="blue">
            {metrics.stalled}
          </Text>
        </Card>
        <Card withBorder className={classes.summaryCard}>
          <Text size="xs" c="dimmed">
            Unassigned
          </Text>
          <Text fw={700} size="xl" c="gray">
            {metrics.unassigned}
          </Text>
        </Card>
      </Group>

      <Paper className={classes.reportToolbar} withBorder>
        <Group justify="space-between" align="center" wrap="wrap">
          <Select
            data={FILTER_OPTIONS.map((entry) => ({
              ...entry,
              label: `${entry.label} (${
                entry.value === "all"
                  ? visibleComplaints.length
                  : derived[entry.value]?.length || 0
              })`,
            }))}
            value={selectedFilter}
            onChange={(value) => setSelectedFilter(value || "all")}
            w={{ base: "100%", sm: 260 }}
          />
          <Text size="sm" c="dimmed">
            Selected: {selectedIds.length}
          </Text>
        </Group>
      </Paper>

      <Paper
        className={`${classes.tablePanel} ${classes.moduleCard}`}
        withBorder
      >
        <ScrollArea className={classes.tableSurface}>
          <Table
            striped
            highlightOnHover
            withTableBorder
            withColumnBorders
            className={classes.tableClean}
            verticalSpacing="sm"
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  <Checkbox
                    checked={allVisibleSelected}
                    indeterminate={
                      selectedIds.length > 0 && !allVisibleSelected
                    }
                    onChange={(event) =>
                      toggleVisibleSelection(event.currentTarget.checked)
                    }
                  />
                </Table.Th>
                <Table.Th>Reference</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Location</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>SLA</Table.Th>
                <Table.Th>Assigned</Table.Th>
                <Table.Th>Issue</Table.Th>
                <Table.Th>Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {visibleComplaints.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={9}>
                    <Text ta="center" c="dimmed">
                      No complaints match this oversight filter.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
              {visibleComplaints.map(({ complaint }) => (
                <Table.Tr key={complaint.id}>
                  <Table.Td>
                    <Checkbox
                      checked={selectedIds.includes(String(complaint.id))}
                      onChange={(event) =>
                        toggleRowSelection(
                          complaint.id,
                          event.currentTarget.checked,
                        )
                      }
                    />
                  </Table.Td>
                  <Table.Td>
                    <Text className={classes.monoRef}>
                      {complaint.complaint_ref || `#${complaint.id}`}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text className={classes.cellClamp}>
                      {complaint.complaint_type}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text className={classes.cellClamp}>
                      {complaint.location}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      variant="light"
                      color={isEscalated(complaint) ? "orange" : "blue"}
                      className={classes.statusBadge}
                    >
                      {STATUS_LABELS.get(Number(complaint.status)) ||
                        complaint.status}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      variant="light"
                      color={isOverdue(complaint) ? "red" : "green"}
                      className={classes.statusBadge}
                    >
                      {isOverdue(complaint) ? "Overdue" : "Within SLA"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text className={classes.cellClamp}>
                      {complaint.assigned_to_name || complaint.worker_id || "-"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text className={classes.cellClamp}>
                      {complaint.details}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Button
                      size="xs"
                      variant="light"
                      leftSection={<ArrowSquareOut size={14} />}
                      onClick={() => onView(complaint.id)}
                    >
                      Open
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      <ComplaintBulkActionModal
        opened={modalOpen}
        mode={modalMode || "reassign"}
        selectedCount={selectedIds.length}
        workers={workers}
        onClose={() => {
          setModalOpen(false);
          setModalMode(null);
        }}
        onSubmit={handleSubmit}
        isLoading={loadingAction || loadingWorkers}
      />
    </Stack>
  );
}

ComplaintOversightPanel.propTypes = {
  complaints: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  onView: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
};
