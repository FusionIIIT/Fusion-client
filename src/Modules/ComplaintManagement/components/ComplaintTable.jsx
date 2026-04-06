import PropTypes from "prop-types";
import { Button, Group, Paper, ScrollArea, Table, Text } from "@mantine/core";

const STATUS_LABELS = new Map([
  [0, "Pending"],
  [1, "In Progress"],
  [2, "Resolved"],
  [3, "Closed"],
]);

export default function ComplaintTable({
  complaints,
  onView,
  onEdit,
  onDelete,
  isCaretaker = false,
}) {
  return (
    <Paper p="md" withBorder radius="md">
      <ScrollArea>
        <Table striped highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Location</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Remarks</Table.Th>
              <Table.Th>Details</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {complaints.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Text ta="center" c="dimmed">
                    No complaints found.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
            {complaints.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>{item.id}</Table.Td>
                <Table.Td>{item.complaint_type}</Table.Td>
                <Table.Td>{item.location}</Table.Td>
                <Table.Td>
                  {STATUS_LABELS.get(Number(item.status)) ?? item.status}
                </Table.Td>
                <Table.Td>{item.remarks || "-"}</Table.Td>
                <Table.Td>{item.details}</Table.Td>
                <Table.Td>
                  <Group gap="xs" wrap="nowrap">
                    <Button
                      size="xs"
                      variant="light"
                      onClick={() => onView(item.id)}
                    >
                      View
                    </Button>
                    {!isCaretaker && (
                      <>
                        <Button
                          size="xs"
                          variant="default"
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
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
}

ComplaintTable.propTypes = {
  complaints: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      complaint_type: PropTypes.string,
      location: PropTypes.string,
      status: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      remarks: PropTypes.string,
      details: PropTypes.string,
    }),
  ).isRequired,
  onView: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  isCaretaker: PropTypes.bool,
};

ComplaintTable.defaultProps = {
  isCaretaker: false,
};
