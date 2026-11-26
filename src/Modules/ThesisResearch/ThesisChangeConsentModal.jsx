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
import { thesisChangeRequestConsentRoute } from "../../routes/academicRoutes";

const ROLE_LABEL = {
  current_supervisor: "Current Supervisor",
  current_co_supervisor: "Current Co-Supervisor",
  new_supervisor: "Proposed New Supervisor",
  new_co_supervisor: "Proposed New Co-Supervisor",
};

export default function ThesisChangeConsentModal({
  request,
  onClose,
  refresh,
}) {
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const authHeaders = () => ({
    Authorization: `Token ${localStorage.getItem("authToken")}`,
  });

  const handle = async (consent) => {
    setLoading(true);
    try {
      await axios.post(
        thesisChangeRequestConsentRoute(request.id),
        { consent, remarks },
        { headers: authHeaders() },
      );
      showNotification({
        title: consent ? "Consent Recorded" : "Declined",
        message: consent
          ? "Your consent has been recorded."
          : "You have declined this change request.",
        color: consent ? "green" : "yellow",
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
      title="Thesis Topic Change Request"
      size="70%"
    >
      <Stack gap="md">
        <Text fw={500}>
          Your Role: {ROLE_LABEL[request.my_role] || request.my_role}
        </Text>

        <Table striped highlightOnHover>
          <Table.Tbody>
            <Table.Tr>
              <Table.Th>Student</Table.Th>
              <Table.Td>
                {request.student_name} ({request.student_roll})
              </Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Current Category</Table.Th>
              <Table.Td>{request.current_category}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Current Broad Area</Table.Th>
              <Table.Td>{request.current_broad_area}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Current Research Theme</Table.Th>
              <Table.Td>{request.current_research_theme}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Current Supervisor</Table.Th>
              <Table.Td>{request.current_supervisor.name}</Table.Td>
            </Table.Tr>
            <Table.Tr>
              <Table.Th>Current Co-Supervisor</Table.Th>
              <Table.Td>{request.current_co_supervisor?.name || "—"}</Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>

        <Text fw={500}>Requested Change</Text>
        <Table striped highlightOnHover>
          <Table.Tbody>
            {request.new_category && (
              <Table.Tr>
                <Table.Th>New Category</Table.Th>
                <Table.Td>{request.new_category}</Table.Td>
              </Table.Tr>
            )}
            {request.new_broad_area && (
              <Table.Tr>
                <Table.Th>New Broad Area</Table.Th>
                <Table.Td>{request.new_broad_area}</Table.Td>
              </Table.Tr>
            )}
            {request.new_research_theme && (
              <Table.Tr>
                <Table.Th>New Research Theme</Table.Th>
                <Table.Td>{request.new_research_theme}</Table.Td>
              </Table.Tr>
            )}
            {request.new_supervisor && (
              <Table.Tr>
                <Table.Th>New Supervisor</Table.Th>
                <Table.Td>{request.new_supervisor.name}</Table.Td>
              </Table.Tr>
            )}
            {request.new_co_supervisor && (
              <Table.Tr>
                <Table.Th>New Co-Supervisor</Table.Th>
                <Table.Td>{request.new_co_supervisor.name}</Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>

        <Textarea
          label="Remarks (if declining)"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
        />
        <Group grow>
          <Button onClick={() => handle(true)} loading={loading}>
            Consent
          </Button>
          <Button color="red" onClick={() => handle(false)} loading={loading}>
            Decline
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

ThesisChangeConsentModal.propTypes = {
  request: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    my_role: PropTypes.string,
    student_name: PropTypes.string,
    student_roll: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    current_category: PropTypes.string,
    current_broad_area: PropTypes.string,
    current_research_theme: PropTypes.string,
    current_supervisor: PropTypes.shape({ name: PropTypes.string }),
    current_co_supervisor: PropTypes.shape({ name: PropTypes.string }),
    new_category: PropTypes.string,
    new_broad_area: PropTypes.string,
    new_research_theme: PropTypes.string,
    new_supervisor: PropTypes.shape({ name: PropTypes.string }),
    new_co_supervisor: PropTypes.shape({ name: PropTypes.string }),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  refresh: PropTypes.func.isRequired,
};
