import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Badge,
  Text,
  Paper,
  Group,
  TextInput,
  Loader,
  Alert,
  Modal,
  Textarea,
} from "@mantine/core";
import { getSubstituteInbox, respondToSubstitute } from "../../services/api";

function SubstituteInbox() {
  const [inboxData, setInboxData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [respondModalOpen, setRespondModalOpen] = useState(false);
  const [selectedNomination, setSelectedNomination] = useState(null);
  const [actionType, setActionType] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInbox();
  }, []);

  const fetchInbox = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSubstituteInbox();
      setInboxData(data);
    } catch (err) {
      setError(
        err?.message || "Failed to fetch substitute inbox. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const openRespondModal = (nomination, action) => {
    setSelectedNomination(nomination);
    setActionType(action);
    setRemarks("");
    setRespondModalOpen(true);
  };

  const handleRespond = async () => {
    if (!selectedNomination) return;
    setSubmitting(true);
    try {
      await respondToSubstitute(selectedNomination.id, actionType, remarks);
      // Remove from list
      setInboxData(inboxData.filter((n) => n.id !== selectedNomination.id));
      setRespondModalOpen(false);
    } catch (err) {
      alert(err?.message || "Failed to submit response.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader size="md" mt="md" />;
  }

  if (error) {
    return (
      <Alert color="red" title="Error" mt="md">
        {error}
      </Alert>
    );
  }

  return (
    <Paper p="md" shadow="sm" withBorder mt="md">
      <Text size="lg" fw={600} mb="xs">
        Substitute Inbox
      </Text>
      <Text size="sm" c="dimmed" mb="md">
        Colleagues have requested you to act as a substitute during their leave.
        Please review and respond to these requests.
      </Text>

      {inboxData.length === 0 ? (
        <Alert color="blue" variant="light">
          No pending substitute requests.
        </Alert>
      ) : (
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Applicant</Table.Th>
              <Table.Th>Responsibility</Table.Th>
              <Table.Th>Leave Dates</Table.Th>
              <Table.Th>Purpose</Table.Th>
              <Table.Th>Requested On</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {inboxData.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {item.applicant_name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {item.applicant_username}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    color={
                      item.responsibility_type === "academic" ? "blue" : "grape"
                    }
                    variant="light"
                  >
                    {item.responsibility_type}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {item.leave_start_date} to {item.leave_end_date}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" lineClamp={2}>
                    {item.leave_purpose || "—"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">
                    {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <Button
                      size="xs"
                      color="green"
                      variant="light"
                      onClick={() => openRespondModal(item, "accept")}
                    >
                      Accept
                    </Button>
                    <Button
                      size="xs"
                      color="red"
                      variant="light"
                      onClick={() => openRespondModal(item, "decline")}
                    >
                      Decline
                    </Button>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      {/* Respond Modal */}
      <Modal
        opened={respondModalOpen}
        onClose={() => setRespondModalOpen(false)}
        title={`Respond to Request`}
      >
        <Text size="sm" mb="sm">
          You are about to{" "}
          <Text span fw={600} c={actionType === "accept" ? "green" : "red"}>
            {actionType}
          </Text>{" "}
          the{" "}
          <Text span fw={600}>
            {selectedNomination?.responsibility_type}
          </Text>{" "}
          substitute request from{" "}
          <Text span fw={600}>
            {selectedNomination?.applicant_name}
          </Text>
          .
        </Text>

        <Textarea
          label="Remarks (Optional)"
          placeholder="Add any comments..."
          value={remarks}
          onChange={(e) => setRemarks(e.currentTarget.value)}
          minRows={3}
          mt="md"
        />

        <Group justify="flex-end" mt="lg">
          <Button variant="default" onClick={() => setRespondModalOpen(false)}>
            Cancel
          </Button>
          <Button
            color={actionType === "accept" ? "green" : "red"}
            onClick={handleRespond}
            loading={submitting}
          >
            Confirm {actionType}
          </Button>
        </Group>
      </Modal>
    </Paper>
  );
}

export default SubstituteInbox;
