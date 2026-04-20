import { useMemo } from "react";
import {
  Accordion,
  Badge,
  Button,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import PropTypes from "prop-types";

const STATUS_LABELS = new Map([
  [0, "Pending"],
  [1, "In Progress"],
  [2, "Resolved"],
  [3, "Closed"],
  [4, "Escalated"],
  [5, "Reopened"],
]);

const STATUS_COLORS = new Map([
  [0, "yellow"], // Pending
  [1, "blue"], // In Progress
  [2, "green"], // Resolved
  [3, "gray"], // Closed
  [4, "red"], // Escalated
  [5, "orange"], // Reopened
]);

const complaintItemShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  complaint_ref: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  complaint_type: PropTypes.string,
  priority: PropTypes.string,
  location: PropTypes.string,
  status: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  is_draft: PropTypes.bool,
  status_label: PropTypes.string,
  sla_deadline: PropTypes.string,
  assigned_to_name: PropTypes.string,
  assigned_to: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  worker_id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  remarks: PropTypes.string,
  details: PropTypes.string,
});

function ComplaintTableRows({
  items,
  onView,
  onEdit,
  onDelete,
  onSubmitDraft,
  isCaretaker,
  readOnly,
}) {
  if (items.length === 0) {
    return (
      <Table.Tr>
        <Table.Td colSpan={11}>
          <Text ta="center" c="dimmed">
            No complaints in this section.
          </Text>
        </Table.Td>
      </Table.Tr>
    );
  }

  return items.map((item) => (
    <Table.Tr key={item.id}>
      <Table.Td>{item.id}</Table.Td>
      <Table.Td>{item.complaint_ref || "-"}</Table.Td>
      <Table.Td>{item.complaint_type}</Table.Td>
      <Table.Td>
        <Badge variant="light">{item.priority || "Standard"}</Badge>
      </Table.Td>
      <Table.Td>{item.location}</Table.Td>
      <Table.Td>
        <Badge color={STATUS_COLORS.get(Number(item.status)) || "gray"}>
          {item.is_draft
            ? "Draft"
            : item.status_label ||
              STATUS_LABELS.get(Number(item.status)) ||
              item.status}
        </Badge>
      </Table.Td>
      <Table.Td>
        {item.sla_deadline ? new Date(item.sla_deadline).toLocaleString() : "-"}
      </Table.Td>
      <Table.Td>
        {item.assigned_to_name || item.assigned_to || item.worker_id || "-"}
      </Table.Td>
      <Table.Td>{item.remarks || "-"}</Table.Td>
      <Table.Td>{item.details}</Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <Button size="xs" variant="light" onClick={() => onView(item.id)}>
            View
          </Button>
          {!isCaretaker && !readOnly && (
            <Group gap="xs" wrap="nowrap">
              {item.is_draft && (
                <Button
                  size="xs"
                  variant="light"
                  onClick={() => onSubmitDraft(item.id)}
                >
                  Submit
                </Button>
              )}
              {!item.is_draft && (
                <>
                  <Button
                    size="xs"
                    variant="light"
                    onClick={() => onEdit(item)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="xs"
                    color="red"
                    variant="light"
                    onClick={() => onDelete(item.id)}
                  >
                    Delete
                  </Button>
                </>
              )}
            </Group>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  ));
}

ComplaintTableRows.propTypes = {
  items: PropTypes.arrayOf(complaintItemShape).isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onSubmitDraft: PropTypes.func.isRequired,
  isCaretaker: PropTypes.bool.isRequired,
  readOnly: PropTypes.bool.isRequired,
};

export default function ComplaintTableSectioned({
  complaints,
  onView,
  onEdit = () => {},
  onDelete = () => {},
  onSubmitDraft = () => {},
  isCaretaker = false,
  readOnly = false,
}) {
  // Group complaints by status
  const groupedComplaints = useMemo(() => {
    const groups = {
      pending: [],
      escalated: [],
      resolved: [],
      other: [],
    };

    complaints.forEach((complaint) => {
      if (complaint.is_draft) {
        groups.other.push(complaint);
      } else if (complaint.status === 0) {
        // Pending
        groups.pending.push(complaint);
      } else if (complaint.status === 4) {
        // Escalated
        groups.escalated.push(complaint);
      } else if (complaint.status === 2 || complaint.status === 3) {
        // Resolved or Closed
        groups.resolved.push(complaint);
      } else {
        groups.other.push(complaint);
      }
    });

    return groups;
  }, [complaints]);

  const sections = [
    {
      key: "pending",
      label: `Pending (${groupedComplaints.pending.length})`,
      data: groupedComplaints.pending,
      icon: "",
      color: "yellow",
    },
    {
      key: "escalated",
      label: `Escalated (${groupedComplaints.escalated.length})`,
      data: groupedComplaints.escalated,
      icon: "",
      color: "red",
    },
    {
      key: "resolved",
      label: `Resolved & Closed (${groupedComplaints.resolved.length})`,
      data: groupedComplaints.resolved,
      icon: "",
      color: "green",
    },
    {
      key: "In progress",
      label: `In progress (${groupedComplaints.other.length})`,
      data: groupedComplaints.other,
      icon: "",
      color: "blue",
    },
  ];

  return (
    <Paper p="md" withBorder radius="md">
      <Stack gap="md">
        {sections.filter((s) => s.data.length > 0).length === 0 ? (
          <Text ta="center" c="dimmed" py="xl">
            No complaints found.
          </Text>
        ) : (
          <Accordion variant="contained">
            {sections.map((section) => (
              <Accordion.Item
                key={section.key}
                value={section.key}
                defaultChecked={["pending", "escalated"].includes(section.key)}
              >
                <Accordion.Control>
                  <Group gap="sm">
                    <Text size="lg">{section.icon}</Text>
                    <Badge color={section.color} size="lg" variant="light">
                      {section.label}
                    </Badge>
                  </Group>
                </Accordion.Control>
                <Accordion.Panel>
                  <ScrollArea>
                    <Table
                      striped
                      highlightOnHover
                      withTableBorder
                      withColumnBorders
                    >
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th>ID</Table.Th>
                          <Table.Th>Reference</Table.Th>
                          <Table.Th>Type</Table.Th>
                          <Table.Th>Priority</Table.Th>
                          <Table.Th>Location</Table.Th>
                          <Table.Th>Status</Table.Th>
                          <Table.Th>SLA</Table.Th>
                          <Table.Th>Assigned</Table.Th>
                          <Table.Th>Remarks</Table.Th>
                          <Table.Th>Details</Table.Th>
                          <Table.Th>Actions</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        <ComplaintTableRows
                          items={section.data}
                          onView={onView}
                          onEdit={onEdit}
                          onDelete={onDelete}
                          onSubmitDraft={onSubmitDraft}
                          isCaretaker={isCaretaker}
                          readOnly={readOnly}
                        />
                      </Table.Tbody>
                    </Table>
                  </ScrollArea>
                </Accordion.Panel>
              </Accordion.Item>
            ))}
          </Accordion>
        )}
      </Stack>
    </Paper>
  );
}

ComplaintTableSectioned.propTypes = {
  complaints: PropTypes.arrayOf(complaintItemShape).isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onSubmitDraft: PropTypes.func,
  isCaretaker: PropTypes.bool,
  readOnly: PropTypes.bool,
};
