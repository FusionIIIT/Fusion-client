import React, { useState } from "react";
import {
  Modal,
  Text,
  Table,
  Textarea,
  Button,
  Stack,
  Group,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import PropTypes from "prop-types";
import { hodCommitteeChangeReviewRoute } from "../../routes/academicRoutes";

export default function HODCommitteeChangeModal({ request, onClose, refresh }) {
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (approve) => {
    setLoading(true);
    try {
      await axios.post(
        hodCommitteeChangeReviewRoute(request.id),
        { approve, remarks },
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("authToken")}`,
          },
        },
      );
      showNotification({
        title: approve ? "Forwarded" : "Rejected",
        message: approve
          ? "Forwarded to Dean Academic."
          : "Sent back to supervisor.",
        color: approve ? "green" : "yellow",
      });
      refresh();
    } catch (e) {
      showNotification({
        title: "Error",
        message: e.response?.data?.error || "Action failed",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened
      onClose={onClose}
      title="Convener (DPGC) Review — Committee Change Request"
      size="80%"
    >
      <Stack gap="md">
        <Table striped highlightOnHover>
          <Table.Tbody>
            <Table.Tr>
              <Table.Th>Student</Table.Th>
              <Table.Td>
                {request.student_name} ({request.student_roll})
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Discipline</Table.Th>
              <Table.Td>{request.student_discipline || "—"}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Supervisor</Table.Th>
              <Table.Td>{request.supervisor.name}</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>

        <Text fw={500}>Current Committee</Text>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Discipline</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {request.current_committee.map((m) => (
              <Table.Tr key={m.id}>
                <Table.Td>{m.name}</Table.Td>
                <Table.Td>{m.discipline}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        <Text fw={500}>Proposed Committee</Text>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Discipline</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {request.proposed_committee.map((m) => (
              <Table.Tr key={m.id}>
                <Table.Td>{m.name}</Table.Td>
                <Table.Td>{m.discipline}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        <Textarea
          label="Remarks (if sending back)"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
        <Group grow>
          <Button onClick={() => handle(true)} loading={loading}>
            Forward
          </Button>
          <Button color="red" onClick={() => handle(false)} loading={loading}>
            Send Back to Supervisor
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

HODCommitteeChangeModal.propTypes = {
  request: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    student_name: PropTypes.string,
    student_roll: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    student_discipline: PropTypes.string,
    supervisor: PropTypes.shape({ name: PropTypes.string }),
    current_committee: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        discipline: PropTypes.string,
      }),
    ),
    proposed_committee: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        discipline: PropTypes.string,
      }),
    ),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};
